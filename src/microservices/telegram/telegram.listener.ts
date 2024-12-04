import { Injectable, Logger } from '@nestjs/common';
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { TelegramHelper } from '../../utils/telegram.helper';

@Injectable()
@Update()
export class TelegramListener {
  private logger = new Logger(TelegramListener.name);

  private readonly logoUrl = process.env.TELEGRAM_LOGO_URL;
  public readonly tChannelLink = process.env.TELEGRAM_COMMUNITY_CHANNEL_LINK;
  private readonly appUrl = process.env.APP_URL;

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

  // @On('successful_payment')
  // successfulPayment(@Ctx() cxt: Context): Promise<void> {
  //   const now = Date.now();
  //   const hash = inchvorFunc(now, cxt.data);
  // }
}
