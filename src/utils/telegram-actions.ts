import { Context, Markup, Telegraf } from 'telegraf';

export class TelegramActions {
  public readonly tChannelLink = process.env.TELEGRAM_COMMUNITY_CHANNEL_LINK;
  public readonly tChannelId = process.env.TELEGRAM_COMMUNITY_CHANNEL_ID;
  public readonly appUrl = process.env.APP_URL;
  private _bot: Telegraf;
  private readonly TELEGRAM_BOT_KEY = process.env.TELEGRAM_BOT_KEY;
  private readonly logoUrl = process.env.TELEGRAM_LOGO_URL;
  private languageBasedText = {
    en: {
      startAppButton: '💸 Start Mining',
      startAppButtonFromRef: '💸 Start Mining with friend',
      joinCommunity: 'ℹ️ Join Community',
    },
    ru: {
      startAppButton: '💸 Начать майнинг',
      startAppButtonFromRef: '💸 Начать майнинг с другом',
      joinCommunity: 'ℹ️ Присоединяйтесь к сообществу',
    },
  };

  public get bot(): Telegraf {
    return this._bot;
  }

  public init(): Telegraf {
    this._bot = new Telegraf(this.TELEGRAM_BOT_KEY, {
      telegram: {
        testEnv: false, // process.env.mode !== 'prod',
      },
    });

    return this._bot;
  }

  public async start(ctx: Context): Promise<void> {
    const lang = this.getProperLanguage(ctx.message.from.language_code);
    const appUrl = new URL(this.appUrl);
    const refUserId = (ctx as any).payload;
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
      ],
      {
        wrap: () => true,
      },
    );

    ctx.setChatMenuButton({
      type: 'commands',
    });

    ctx.sendPhoto(
      { url: this.logoUrl },
      {
        ...markup,
        caption: 'TEST',
      },
    );
  }

  public sendInvoice(ctx): void {
    const title = 'Digital Item';
    const description = 'Purchase this amazing digital item!';
    const payload = 'UniquePayload';
    const providerToken = ''; // empty for XTR
    const currency = 'XTR'; // Set currency to XTR
    const price = 1; // Price in XTR (adjust as needed)

    ctx.sendInvoice({
      title,
      description,
      payload,
      provider_token: providerToken,
      currency,
      prices: [
        {
          label: 'Digital Item',
          amount: price,
        },
      ],
      start_parameter: 'test',
      is_flexible: false,
    });
  }

  private getProperLanguage(userLang: string): string {
    switch (userLang) {
      case 'ru':
      case 'en':
        return userLang;
      default:
        return 'en';
    }
  }
}
