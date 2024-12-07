import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { TgWebhookValidatorGuard } from '../../shared/guards/tg-webhook-validator.guard';
import { TelegramWebhookService } from './telegram-webhook.service';

@Controller('telegram-webhook-handler')
@UseGuards(TgWebhookValidatorGuard)
export class TelegramWebhookController {
  constructor(private telegramWebhookService: TelegramWebhookService) {}

  @Post('successful-payment')
  telegramStarSuccessfulPaymentHandler(
    @Body() body: SecurePayloadDto<SuccessPayment>,
  ): Promise<void> {
    return this.telegramWebhookService.handleOrderCreatedEvent(body.payload);
  }
}
