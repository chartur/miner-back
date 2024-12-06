import {
  CanActivate,
  ExecutionContext, ForbiddenException,
  Injectable,
  Logger
} from "@nestjs/common";
import { Observable } from 'rxjs';
import { Request } from 'express';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { tgBotMicroValidator } from '../../utils/telegram-data-validator';

@Injectable()
export class TgWebhookValidatorGuard implements CanActivate {
  private logger = new Logger(TgWebhookValidatorGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as SecurePayloadDto<any>;
    try {
      if (body.hash === tgBotMicroValidator(body.lt, body.payload)) {
        this.logger.log('[TelegramWebhookValidator] Successfully validated:', {
          body,
        });
        return true;
      }
      this.logger.error('[TelegramWebhookValidator] Failed validate:', {
        body,
      });
      return false;
    } catch (e: unknown) {
      this.logger.error('[TelegramWebhookValidator] Failed validate:', {
        body,
        e
      });
      return false;
    }
  }
}
