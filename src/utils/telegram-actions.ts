import { Context, Markup, Telegraf } from 'telegraf';
import { Language } from '../core/models/enums/language';
import { join } from 'path';
import { readFile } from 'fs/promises';

export class TelegramActions {
  public readonly tChannelLink = process.env.TELEGRAM_COMMUNITY_CHANNEL_LINK;
  public readonly tChannelId = process.env.TELEGRAM_COMMUNITY_CHANNEL_ID;
  public readonly appUrl = process.env.APP_URL;
  public readonly tBotUrl = process.env.TELEGRAM_BOT_URL;
  private _bot: Telegraf;
  private readonly TELEGRAM_BOT_KEY = process.env.TELEGRAM_BOT_KEY;
  private readonly logoUrl = process.env.TELEGRAM_LOGO_URL;
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
        Markup.button.url(
          this.languageBasedText[lang].policy,
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
        caption: await this.getTranslationText(
          lang,
          'startup-description',
        ).then((res) => res.replace('{{ name }}', ctx.from.first_name)),
        parse_mode: 'HTML',
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

  public getTranslationText(lang: Language, file: string): Promise<string> {
    return readFile(
      join(__dirname, '..', 'assets', 'telegram-assets', lang, `${file}.txt`),
      'utf-8',
    );
  }

  private getProperLanguage(userLang: string): Language {
    switch (userLang) {
      case 'ru':
      case 'en':
        return userLang as Language;
      default:
        return Language.EN;
    }
  }
}
