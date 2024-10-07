import { Injectable } from '@nestjs/common';
import { TelegramActions } from '../../utils/telegram-actions';
import { TelegramActionTypes } from '../../core/models/enums/telegram-action-types';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private _telegramAction: TelegramActions;
  private _bot: Telegraf;

  constructor() {
    this.init();
  }

  // public sendMessageInTheChannel(message: string) {
  //   const markup = Markup.inlineKeyboard([
  //     Markup.button.url('🛒 Տեսնել ավելին', this.botLink),
  //   ]);
  //   this.bot.telegram.sendPhoto(
  //     this.channelusername,
  //     { url: this.logoUrl },
  //     {
  //       ...markup,
  //       caption: message,
  //     },
  //   );
  // }

  private async init(): Promise<void> {
    this._telegramAction = new TelegramActions();

    this._bot = this._telegramAction.init();

    this._bot.command('start', (ctx) => this._telegramAction.start(ctx));

    this._bot.on('pre_checkout_query', (cxt) => {
      cxt.answerPreCheckoutQuery(true);
    });

    this._bot.on('callback_query', (ctx) => {
      const action: string = (ctx.callbackQuery as any).data;
      switch (action) {
        case TelegramActionTypes.JOIN_CHANNEL:
          return this._telegramAction.joinCommunityChannelHandler(ctx);
        case TelegramActionTypes.SEND_INVOICE:
          return this._telegramAction.sendInvoice(ctx);
      }
    });

    this._bot.launch();
  }

  public async getUserProfilePhoto(
    telegramUserId: number,
  ): Promise<string | null> {
    const photo = await this._bot.telegram
      .getUserProfilePhotos(telegramUserId, 0, 1)
      .then((res) => (res.total_count > 0 ? res.photos[0][0] : undefined));

    if (photo) {
      const data = await this._bot.telegram.getFileLink(photo.file_id);
      return data?.href;
    }

    return null;
  }
}
