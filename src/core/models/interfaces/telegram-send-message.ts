import { InlineKeyboardMarkup } from 'telegraf/src/core/types/typegram';
import { Markup } from 'telegraf/src/markup';

export interface TelegramSendMessage {
  chatId: string;
  text?: string;
  photoUrl?: string;
  buttons?: Markup<InlineKeyboardMarkup>;
}
