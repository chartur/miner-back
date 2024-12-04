import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import { Markup } from 'telegraf/src/markup';
import { ParseMode } from '@telegraf/types/message';

export interface TelegramSendMessage {
  chatId: string;
  text?: string;
  photoUrl?: string;
  buttons?: Markup<InlineKeyboardMarkup>;
  parseMode?: ParseMode;
}
