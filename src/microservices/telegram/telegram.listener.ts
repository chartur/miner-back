import { Injectable, Logger } from '@nestjs/common';
import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { TelegramHelper } from '../../utils/telegram.helper';
import { tgBotMicroValidator } from '../../utils/telegram-data-validator';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { HttpService } from '@nestjs/axios';
import { Message, Update as ContextType } from '@telegraf/types';
import MessageUpdate = ContextType.MessageUpdate;
import SuccessfulPaymentMessage = Message.SuccessfulPaymentMessage;
import { catchError, EMPTY } from 'rxjs';

@Injectable()
@Update()
export class TelegramListener {
  private logger = new Logger(TelegramListener.name);

  private readonly logoUrl = process.env.TELEGRAM_LOGO_URL;
  public readonly tChannelLink = process.env.TELEGRAM_COMMUNITY_CHANNEL_LINK;
  private readonly appUrl = process.env.APP_URL;
  private tgWebhookUrl = `${this.appUrl}/api/telegram-webhook-handler`;

  private languageBasedText = {
    en: {
      startAppButton: '⭐️Start Mining ⭐',
      startAppButtonFromRef: '⭐ Start Mining with friend ⭐',
      joinCommunity: '🚀️Join Community 🚀',
      policy: '💡Information 💡',
    },
    ru: {
      startAppButton: '⭐ Начать майнинг ⭐',
      startAppButtonFromRef: '⭐ Начать майнинг с другом ⭐',
      joinCommunity: '🚀 Присоединяйтесь к сообществу 🚀',
      policy: '💡 Информация 💡',
    },
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectBot()
    private readonly bot: Telegraf<Context>,
  ) {}

  @Start()
  public async start(@Ctx() ctx: Context) {
    const lang = TelegramHelper.getProperLanguage(ctx.from.language_code);
    const refUserId = (ctx as any).payload;
    const appUrl = new URL(this.appUrl);
    let startButtonText = this.languageBasedText[lang].startAppButton;
    if (refUserId) {
      appUrl.searchParams.append('ref', refUserId);
      startButtonText = this.languageBasedText[lang].startAppButtonFromRef;
    }

    const markup = Markup.inlineKeyboard(
      [
        Markup.button.webApp(startButtonText, appUrl.toString()),
        Markup.button.url(
          this.languageBasedText[lang].joinCommunity,
          this.tChannelLink,
        ),
        Markup.button.url(
          this.languageBasedText[lang].policy,
          this.tChannelLink,
        ),
      ],
      {
        wrap: () => true,
      },
    );

    ctx.sendPhoto(
      { url: this.logoUrl },
      {
        ...markup,
        caption: await TelegramHelper.getTranslationText(
          lang,
          'startup-description',
        ).then((res) => res.replace('{{ name }}', ctx.from.first_name)),
        parse_mode: 'HTML',
      },
    );
  }

  @On('pre_checkout_query')
  preCheckout(@Ctx() ctx: Context<ContextType.PreCheckoutQueryUpdate>) {
    this.bot.telegram.answerPreCheckoutQuery(
      ctx.update.pre_checkout_query.id,
      true,
    );
  }

  @On('successful_payment')
  successfulPayment(
    @Ctx() ctx: Context<MessageUpdate<SuccessfulPaymentMessage>>,
  ): void {
    const body = ctx.update.message.successful_payment;
    console.log(body);
    const dateNow = Date.now();
    const hash = tgBotMicroValidator(dateNow, body);

    const payload: SecurePayloadDto<SuccessPayment> = {
      hash,
      payload: body,
      lt: dateNow,
    };
    this.httpService
      .post(`${this.tgWebhookUrl}/successful-payment`, payload)
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }
}
