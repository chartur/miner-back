import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BoostEntity } from '../../entites/boost.entity';
import { UserEntity } from '../../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivateBoostDto } from '../../core/models/dto/activate-boost.dto';
import { BoostDetailsService } from '../../shared/services/boost-details.service';
import moment from 'moment';
import { TransactionsService } from '../../shared/services/transactions.service';
import { InvoiceDto } from '../../core/models/dto/response/invoice.dto';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { ConfigService } from '@nestjs/config';
import { InvoiceAction } from '../../core/models/enums/invoice-action';
import { BoostLevels } from '../../core/models/enums/boost-levels';
import { LinkResponseDto } from '../../core/models/dto/response/link.response.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { TelegramClient } from '../../clients/telegram.client';
import { TelegramHelper } from '../../utils/telegram.helper';

@Injectable()
export class BoostService {
  private logger: Logger = new Logger(BoostService.name);

  constructor(
    @InjectRepository(BoostEntity)
    private boostEntityRepository: Repository<BoostEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
    private boostDetailsService: BoostDetailsService,
    private transactionsService: TransactionsService,
    private configService: ConfigService,
    private telegramClient: TelegramClient,
  ) {}

  public getUserBoost(authUser: UserEntity): Promise<BoostEntity | null> {
    this.logger.log('[Boost] get user boost', {
      authUser,
    });

    return this.boostEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
  }

  public async createInvoice(
    user: UserEntity,
    body: ActivateBoostDto,
  ): Promise<InvoiceDto> {
    const userInvoicesCount = await this.invoiceEntityRepository.count({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    const maxInvoiceCount = Number(
      this.configService.get<string>('MAX_INVOICE_COUNT'),
    );
    if (userInvoicesCount >= maxInvoiceCount) {
      throw new BadRequestException(
        'Your invoice limit is expired. Please try later',
      );
    }

    const boostDetails = this.boostDetailsService.getDetail(body.boostType);
    if (!boostDetails) {
      throw new BadRequestException('Boost not found');
    }

    const invoiceAction = this.getInvoiceActionFromBoostType(body.boostType);

    return await this.transactionsService.createInvoice(
      user.id,
      boostDetails.price,
      invoiceAction,
    );
  }

  public async activate(
    authUser: UserEntity,
    invoiceAction: InvoiceAction,
    now: moment.Moment,
  ): Promise<BoostEntity> {
    this.logger.log('[Boost] activate', {
      authUser,
      invoiceAction,
      now,
    });

    const boostType = this.getBoostTypeFromInvoiceAction(invoiceAction);

    const boostDetails = this.boostDetailsService.getDetail(boostType);
    if (!boostDetails) {
      throw new BadRequestException('Boost not found');
    }
    const expirationDate = now.clone().add(10, 'days');
    const boostDto = this.boostEntityRepository.create({
      boostLevel: boostType,
      boostActivationDate: now,
      boostExpirationDate: expirationDate,
      amountPerClaim: boostDetails.perClaim,
      refPercent: boostDetails.refCashback,
      user: authUser,
    });
    return await this.boostEntityRepository.save(boostDto);
  }

  public async getClaimNotificationActivationInvoice(
    user: UserEntity,
  ): Promise<LinkResponseDto> {
    this.logger.log('[Boost] Claim notification activation invoice creation', {
      user,
    });
    await this.invoiceEntityRepository.delete({
      user,
      action: InvoiceAction.CLAIM_NOTIFICATION,
    });
    const [title, description] = await Promise.all([
      TelegramHelper.getTranslationText(
        user.languageCode,
        'claim-notifier-title',
      ),
      TelegramHelper.getTranslationText(
        user.languageCode,
        'claim-notifier-description',
      ),
    ]);
    const amount = Number(
      this.configService.get<number>('CLAIM_REMINDER_PRICE'),
    );
    const invoice = await this.invoiceEntityRepository.save({
      amount,
      action: InvoiceAction.CLAIM_NOTIFICATION,
      details: description,
      user,
    });
    const link = await this.telegramClient.createStarsInvoiceLink(
      title,
      invoice,
    );
    console.log(link);
    return {
      link,
    };
  }

  public getBoostTypeFromInvoiceAction(
    invoiceAction: InvoiceAction,
  ): BoostLevels {
    switch (invoiceAction) {
      case InvoiceAction.BOOST_MINI:
        return BoostLevels.MINI;
      case InvoiceAction.BOOST_MAJOR:
        return BoostLevels.MAJOR;
      case InvoiceAction.BOOS_MEGA:
        return BoostLevels.MEGA;
    }
  }

  public getInvoiceActionFromBoostType(boostType: BoostLevels): InvoiceAction {
    switch (boostType) {
      case BoostLevels.MINI:
        return InvoiceAction.BOOST_MINI;
      case BoostLevels.MAJOR:
        return InvoiceAction.BOOST_MAJOR;
      case BoostLevels.MEGA:
        return InvoiceAction.BOOS_MEGA;
    }
  }

  public async handleOrderCreatedEvent(payload: SuccessPayment): Promise<void> {
    this.logger.log('[Boost] successful payment', {
      payload,
    });

    const invoice = await this.invoiceEntityRepository.findOne({
      where: {
        id: payload.invoice_payload,
      },
      relations: {
        user: {
          wallet: true,
          settings: true,
        },
      },
    });

    if (!invoice) {
      this.logger.log('[Boost] successful payment: Invoice not found', {
        invoiceId: payload.invoice_payload,
      });
      return;
    }
    const now = moment();
    switch (invoice.action) {
      case InvoiceAction.CLAIM_NOTIFICATION:
        const user = invoice.user;
        user.settings.claimNotificationEnabled = true;
        user.settings.claimNotificationExpiration = now
          .add(1, 'months')
          .toDate();
        user.wallet.notifiedForClaim = false;
        await this.userEntityRepository.save(user);
        await this.invoiceEntityRepository.remove(invoice);
        break;
    }
  }
}
