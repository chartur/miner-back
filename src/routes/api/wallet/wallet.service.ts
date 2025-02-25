import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WalletEntity } from '../../../entites/wallet.entity';
import { UserEntity } from '../../../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import moment from 'moment';
import { BoostLevels } from '../../../core/models/enums/boost-levels';
import { BoostEntity } from '../../../entites/boost.entity';
import { HttpFailureActionTypes } from '../../../core/models/enums/http-failure-action-types';
import { GetCurrencyRateDtoResponse } from '../../../core/models/dto/response/get-currency-rate.dto.response';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RefEntity } from '../../../entites/ref.entity';
import BigDecimal from 'js-big-decimal';
import { BoostDetailsService } from '../../../shared/services/boost-details.service';
import { ConfigService } from '@nestjs/config';
import { TelegramClient } from '../../../clients/telegram.client';

@Injectable()
export class WalletService {
  private logger: Logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    @InjectRepository(BoostEntity)
    private boostEntityRepository: Repository<BoostEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(RefEntity)
    private refEntityRepository: Repository<RefEntity>,
    private dataSource: DataSource,
    private telegramClient: TelegramClient,
    private httpService: HttpService,
    private boostDetailsService: BoostDetailsService,
    private configService: ConfigService,
  ) {}

  public async getMyWallet(authUser: UserEntity): Promise<WalletEntity> {
    this.logger.log('[Wallet] get my wallet', {
      authUser,
    });
    return this.walletEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
  }

  public async claim(authUser: UserEntity): Promise<WalletEntity> {
    const wallet = await this.walletEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
    const unsubscribedClaimCount = this.configService.get<number>(
      'UNSUBSCRIBED_CLIM_COUNT',
    );
    if (wallet.claimCount >= unsubscribedClaimCount) {
      const isSubscribed =
        await this.telegramClient.isUserSubscribedToCommunityChannel(
          authUser.tUserId,
        );
      if (!isSubscribed) {
        throw new HttpException(
          {
            action: HttpFailureActionTypes.NEED_TO_SUBSCRIBE_CHANNEL,
            message:
              'To continue claim you profit you need to be subscribed our community channel',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const now = moment();
    if (!wallet.lastClaimDateTime) {
      wallet.lastClaimDateTime = now.toDate();
      return this.walletEntityRepository.save(wallet);
    }

    if (
      wallet.lastClaimDateTime &&
      now.diff(moment(wallet.lastClaimDateTime), 'hours') < 5
    ) {
      throw new HttpException(
        {
          action: HttpFailureActionTypes.CLAIM_BEFORE_EXPECTED_TIME,
          message: 'You can not claim your profit before 5 hours',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.claimFunc(authUser, wallet, now);
  }

  public getRates(): Promise<GetCurrencyRateDtoResponse | { error: string }> {
    return firstValueFrom(
      this.httpService.get<GetCurrencyRateDtoResponse>(
        process.env.GET_CURRENCY_RATE_LINK,
      ),
    ).then((res) => res.data);
  }

  public async claimFunc(
    user: UserEntity,
    wallet: WalletEntity,
    now: moment.Moment,
  ): Promise<WalletEntity> {
    let amount = 0;
    let seconds = parseInt(
      this.configService.get<string>('PERIOD_WITH_SECONDS'),
    );
    const walletLastClaimedDate = moment(wallet.lastClaimDateTime);
    const boost = await this.boostEntityRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    if (boost) {
      const boostLevel = boost.boostLevel;
      const boostValues = this.boostDetailsService.getDetail(boostLevel);
      const boostExpirationMoment = moment(boost.boostExpirationDate);
      if (boostExpirationMoment.isBefore(now)) {
        const boostSeconds = boostExpirationMoment.diff(
          walletLastClaimedDate,
          'seconds',
        );
        amount = boostValues.perSecondNonotonRevenue * boostSeconds;
        seconds -= boostSeconds;
      } else {
        amount = boostValues.perSecondNonotonRevenue * seconds;
      }
    } else {
      const boostValues = this.boostDetailsService.getDetail(BoostLevels.USUAL);
      amount = boostValues.perSecondNonotonRevenue * seconds;
    }

    const referrer = await this.refEntityRepository.findOne({
      where: {
        referral: {
          id: user.id,
        },
      },
      relations: {
        referrer: {
          boosts: true,
          wallet: true,
        },
      },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      if (referrer) {
        const lastRefClaimDateTime = moment(
          referrer.referrer.wallet.lastRefsClaimDateTime,
        );
        if (lastRefClaimDateTime.add(1, 'weeks').isAfter(now)) {
          let boostLevel = BoostLevels.USUAL;
          if (referrer.referrer?.boost) {
            boostLevel = referrer.referrer.boost.boostLevel;
          }
          const percent =
            this.boostDetailsService.getDetail(boostLevel).refCashback;
          referrer.nonClaimedRevenue += (amount * percent) / 100;
          await this.refEntityRepository.save(referrer);
        }
      }

      wallet.claimCount++;
      wallet.notifiedForClaim = false;
      wallet.lastClaimDateTime = now.toDate();
      const tonByNonoton = parseInt(
        this.configService.get<string>('TON_BY_NONOTON'),
      );
      const tonValue = amount / tonByNonoton + wallet.tons;
      wallet.tons = parseFloat(
        new BigDecimal(tonValue).round(6).stripTrailingZero().getValue(),
      );
      if (boost && moment(boost.boostExpirationDate).isBefore(now)) {
        await this.boostEntityRepository.remove(boost);
      }
      return this.walletEntityRepository.save(wallet);
    } catch (error) {
      this.logger.log('[WalletService] Failure: ClaimFunc error', {
        error,
      });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
