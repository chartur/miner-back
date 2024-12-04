import { Language } from '../core/models/enums/language';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class TelegramHelper {
  public static getAppUrl(): URL {
    const appUrl = process.env.APP_URL;
    return new URL(appUrl);
  }

  public static getTranslationText(
    lang: Language,
    file: string,
  ): Promise<string> {
    return readFile(
      join(__dirname, '..', 'assets', 'telegram-assets', lang, `${file}.txt`),
      'utf-8',
    );
  }

  public static getProperLanguage(userLang: string): Language {
    switch (userLang) {
      case 'ru':
      case 'en':
        return userLang as Language;
      default:
        return Language.EN;
    }
  }
}
