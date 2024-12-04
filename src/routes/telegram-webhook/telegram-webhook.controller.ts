import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TgWebhookValidatorGuard } from '../../shared/guards/tg-webhook-validator.guard';

@Controller('telegram-webhook-handler')
@UseGuards(TgWebhookValidatorGuard)
export class TelegramWebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Post('successful-payment')
  telegramStarSuccessfulPaymentHandler(
    @Body() body: SecurePayloadDto<SuccessPayment>,
  ) {
    this.eventEmitter.emit('boost.invoice.successful', body.payload);
  }
}
