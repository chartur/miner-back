import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { TgWebhookValidatorGuard } from '../../shared/guards/tg-webhook-validator.guard';
import { BoostService } from '../boost/boost.service';

@Controller('telegram-webhook-handler')
@UseGuards(TgWebhookValidatorGuard)
export class TelegramWebhookController {
  constructor(private boostService: BoostService) {}

  @Post('successful-payment')
  telegramStarSuccessfulPaymentHandler(
    @Body() body: SecurePayloadDto<SuccessPayment>,
  ): Promise<void> {
    return this.boostService.handleOrderCreatedEvent(body.payload);
  }
}
