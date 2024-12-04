import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InvoiceEntity } from '../entites/invoice.entity';
import { TelegramSendMessage } from '../core/models/interfaces/telegram-send-message';

@Injectable()
export class TelegramClient implements OnApplicationBootstrap {
  constructor(@Inject('TELEGRAM_BOT') private client: ClientProxy) {}

  async onApplicationBootstrap() {
    this.client
    await this.client.connect();
  }

  public isUserSubscribedToCommunityChannel(tUserId: string): Promise<boolean> {
    return firstValueFrom(
      this.client.send<boolean>(
        { cmd: 'isUserSubscribedToCommunityChannel' },
        { tUserId },
      ),
    );
  }

  public createStarsInvoiceLink(
    title: string,
    invoice: InvoiceEntity,
  ): Promise<string> {
    return firstValueFrom(
      this.client.send<string>(
        { cmd: 'createStarsInvoiceLink' },
        { title, invoice },
      ),
    );
  }

  public sendMessage(data: TelegramSendMessage): Promise<void> {
    return firstValueFrom(this.client.emit<void>({ cmd: 'sendMessage' }, data));
  }
}
