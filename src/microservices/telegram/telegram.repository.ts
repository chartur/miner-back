import { Injectable, Logger } from '@nestjs/common';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { TelegramChannelUserValidTypes } from '../../core/models/enums/telegram-channel-user-valid-types';
import { ConfigService } from '@nestjs/config';
import { TelegramSendMessage } from '../../core/models/interfaces/telegram-send-message';

@Injectable()
export class TelegramRepository {
  private logger = new Logger(TelegramRepository.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private configService: ConfigService,
  ) {}

  public isUserSubscribedToCommunityChannel(tUserId: string): Promise<boolean> {
    const channelId = this.configService.get<string>(
      'TELEGRAM_COMMUNITY_CHANNEL_ID',
    );
    return this.bot.telegram
      .getChatMember(channelId, Number(tUserId))
      .then((res) =>
        Object.values(TelegramChannelUserValidTypes).includes(
          res.status as TelegramChannelUserValidTypes,
        ),
      );
  }

  public createStarsInvoiceLink(
    title: string,
    invoice: InvoiceEntity,
  ): Promise<string> {
    const description = invoice.details;
    const payload = invoice.id;
    const providerToken = ''; // empty for XTR
    const currency = 'XTR'; // Set currency to XTR
    const price = invoice.amount; // Price in XTR (adjust as needed)

    return this.bot.telegram.createInvoiceLink({
      title,
      description,
      payload,
      provider_token: providerToken,
      currency,
      prices: [
        {
          label: title,
          amount: price,
        },
      ],
    });
  }

  public sendMessage(data: TelegramSendMessage): Promise<void> {
    if (data.photoUrl) {
      return this.bot.telegram
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
    return this.bot.telegram
      .sendMessage(data.chatId, data.text, {
        ...data.buttons,
        parse_mode: data.parseMode,
      })
      .then();
  }

  public setMessageInChannel(
    data: Omit<TelegramSendMessage, 'chatId'>,
  ): Promise<void> {
    const channelId = this.configService.get<string>(
      'TELEGRAM_COMMUNITY_CHANNEL_ID',
    );
    return this.sendMessage({
      ...data,
      chatId: channelId,
    });
  }
}
