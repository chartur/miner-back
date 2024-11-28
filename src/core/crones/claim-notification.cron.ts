import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { WalletEntity } from '../../entites/wallet.entity';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { TelegramService } from '../../shared/services/telegram.service';
import { Language } from '../models/enums/language';
import { Markup } from 'telegraf';

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
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async handleCron(): Promise<void> {
    this.logger.log('[ClaimNotificationCron] Cron started');
    try {
      const period = this.configService.get<number>('PERIOD_WITH_SECONDS');
      const wallets = await this.walletEntityRepository.find({
        where: {
          lastClaimDateTime: LessThan(
            moment().subtract(period, 'seconds').toDate(),
          ),
          notifiedForClaim: false,
        },
        relations: {
          user: true,
        },
      });

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
