import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { TelegramRepository } from './telegram.repository';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { TelegramSendMessage } from '../../core/models/interfaces/telegram-send-message';

@Controller()
export class TelegramController {
  constructor(private telegramRepository: TelegramRepository) {}

  @MessagePattern({ cmd: 'isUserSubscribedToCommunityChannel' })
  public isUserSubscribedToCommunityChannel(data: {
    tUserId: string;
  }): Promise<boolean> {
    return this.telegramRepository.isUserSubscribedToCommunityChannel(
      data.tUserId,
    );
  }

  @MessagePattern({ cmd: 'createStarsInvoiceLink' })
  public createStarsInvoiceLink(data: {
    title: string;
    invoice: InvoiceEntity;
  }): Promise<string> {
    return this.telegramRepository.createStarsInvoiceLink(
      data.title,
      data.invoice,
    );
  }

  @EventPattern({ cmd: 'sendMessage' })
  public sendMessage(data: TelegramSendMessage): Promise<void> {
    return this.telegramRepository.sendMessage(data);
  }
}
