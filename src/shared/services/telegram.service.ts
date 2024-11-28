import { Injectable, Logger, Scope } from '@nestjs/common';
import { TelegramActions } from '../../utils/telegram-actions';
import { TelegramActionTypes } from '../../core/models/enums/telegram-action-types';
import { Telegraf } from 'telegraf';
import { TelegramChannelUserValidTypes } from '../../core/models/enums/telegram-channel-user-valid-types';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { TelegramSendMessage } from '../../core/models/interfaces/telegram-send-message';
import { Language } from '../../core/models/enums/language';

@Injectable({
  scope: Scope.DEFAULT,
})
export class TelegramService {
  private logger = new Logger(TelegramService.name);
  private _telegramAction: TelegramActions;
  private _bot: Telegraf;

  constructor(private httpService: HttpService) {
    this.init();
  }

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
        case TelegramActionTypes.SEND_INVOICE:
          return this._telegramAction.sendInvoice(ctx);
      }
    });

    this._bot.launch();
  }

  public getAppUrl(): URL {
    return new URL(this._telegramAction.appUrl);
  }

  public async *getUserProfilePhoto(
    telegramUserId: number,
  ): AsyncGenerator<string | null, string | null, void> {
    const photo = await this._bot.telegram
      .getUserProfilePhotos(Number(telegramUserId), 0, 1)
      .then((res) => (res.total_count > 0 ? res.photos[0][0] : undefined));

    yield photo?.file_id || null;

    if (photo) {
      const data = await this._bot.telegram.getFileLink(photo.file_id);

      if (data.href) {
        return await lastValueFrom(
          this.httpService.get<Buffer>(data.href, {
            responseType: 'arraybuffer',
          }),
        ).then((res) => {
          const base64 = Buffer.from(res.data).toString('base64');
          return `data:image/png;base64, ${base64}`;
        });
      }
    }

    return null;
  }

  public isUserSubscribedToCommunityChannel(tUserId: string): Promise<boolean> {
    return this._bot.telegram
      .getChatMember(this._telegramAction.tChannelId, Number(tUserId))
      .then((res) =>
        Object.values(TelegramChannelUserValidTypes).includes(
          res.status as TelegramChannelUserValidTypes,
        ),
      );
  }

  public sendMessage(data: TelegramSendMessage): Promise<void> {
    if (data.photoUrl) {
      return this._bot.telegram
        .sendPhoto(
          data.chatId,
          { url: data.photoUrl },
          {
            caption: data.text,
            parse_mode: data.parseMode,
            ...data.buttons,
          },
        )
        .then();
    }
    return this._bot.telegram
      .sendMessage(data.chatId, data.text, {
        ...data.buttons,
        parse_mode: data.parseMode,
      })
      .then();
  }

  public setMessageInChannel(
    data: Omit<TelegramSendMessage, 'chatId'>,
  ): Promise<void> {
    return this.sendMessage({
      ...data,
      chatId: this._telegramAction.tChannelId,
    });
  }

  public getTranslationText(lang: Language, file: string): Promise<string> {
    return this._telegramAction.getTranslationText(lang, file);
  }
}
