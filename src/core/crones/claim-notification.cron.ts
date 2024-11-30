import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { WalletEntity } from '../../entites/wallet.entity';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../../shared/services/telegram.service';
import { Language } from '../models/enums/language';
import { Markup } from 'telegraf';
import { UserSettingsEntity } from '../../entites/user-settings.entity';
import moment from 'moment';

@Injectable()
export class ClaimNotificationCron {
  private logger = new Logger(ClaimNotificationCron.name);
  private photoUrl: string =
    'https://drive.google.com/uc?export=view&id=12QDRFYhp_XyhI4PN2S2ZiuAYoqP8v0Xc';
  private languageBasedText = {
    en: {
      claim: '💎Claim',
    },
    ru: {
      claim: '💎Собирать',
    },
  };

  constructor(
    @InjectRepository(UserSettingsEntity)
    private userSettingsEntityRepository: Repository<UserSettingsEntity>,
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async handleCron(): Promise<void> {
    this.logger.log('[ClaimNotificationCron] Cron started');
    try {
      const period = Number(
        this.configService.get<number>('PERIOD_WITH_SECONDS'),
      );
      const now = moment();
      const lastClaimDateOffset = now.subtract(period, 'seconds').toDate();
      const wallets = await this.walletEntityRepository
        .createQueryBuilder('wallet')
        .innerJoin('wallet.user', 'user')
        .innerJoin('user.settings', 'settings')
        .where(
          'settings.claimNotificationEnabled = :claimNotificationEnabled',
          { claimNotificationEnabled: true },
        )
        .andWhere('wallet.lastClaimDateTime < :lastClaimDateOffset', {
          lastClaimDateOffset,
        })
        .andWhere('wallet.notifiedForClaim = :notified', {
          notified: false,
        })
        .addSelect(['user', 'wallet', 'settings'])
        .getMany();

      const [enText, ruText] = await Promise.all([
        await this.telegramService.getTranslationText(
          Language.EN,
          'claim-notification',
        ),
        await this.telegramService.getTranslationText(
          Language.RU,
          'claim-notification',
        ),
      ]);

      Promise.all(
        wallets.map((w) =>
          this.telegramService.sendMessage({
            chatId: w.user.tUserId,
            photoUrl: this.photoUrl,
            text: w.user.languageCode === Language.RU ? ruText : enText,
            buttons: Markup.inlineKeyboard([
              Markup.button.webApp(
                this.languageBasedText[w.user.languageCode].claim,
                this.telegramService.getAppUrl().toString(),
              ),
            ]),
            parseMode: 'HTML',
          }),
        ),
      );

      const walletIds = wallets.map((w) => w.id);
      await this.walletEntityRepository.update(
        {
          id: In(walletIds),
        },
        { notifiedForClaim: true },
      );
      await this.userSettingsEntityRepository.update(
        {
          claimNotificationEnabled: true,
          claimNotificationExpiration: LessThan(now.toDate()),
        },
        { claimNotificationEnabled: false, claimNotificationExpiration: null },
      );

      this.logger.log('[ClaimNotificationCron] Notification sent to claim', {
        walletIds,
      });
    } catch (error) {
      this.logger.log(
        '[ClaimNotificationCron] Failure: Send claim notifications',
        {
          error,
        },
      );
    }
  }
}
