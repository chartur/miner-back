import { Body, Controller, Post } from '@nestjs/common';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('telegram-webhook-handler')
export class TelegramWebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Post('successful-payment')
  telegramStarSuccessfulPaymentHandler(
    @Body() body: SecurePayloadDto<SuccessPayment>,
  ) {
    this.eventEmitter.emit('boost.invoice.successful', body.payload);
  }
}
