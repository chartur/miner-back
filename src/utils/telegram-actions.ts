import { Context, Markup, Telegraf } from 'telegraf';

export class TelegramActions {
  public readonly tChannelLink = process.env.telegramChannelLink;
  public readonly tChannelId = process.env.telegramChannelId;
  private _bot: Telegraf;
  private readonly telegramKey = process.env.telegramKey;
  private readonly appUrl = process.env.appUrl;
  private readonly botLink = process.env.telegramBotLink;
  private readonly channelusername = '+Bt5aFCboM-k2MzMy';
  private readonly logoUrl = process.env.telegramLogoUrl;
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
    this._bot = new Telegraf(this.telegramKey, {
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
