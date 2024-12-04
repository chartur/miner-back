import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { SecurePayloadDto } from '../../core/models/dto/telegram-microservice/secure-payload.dto';
import { tgBotMicroValidator } from '../../utils/telegram-data-validator';

@Injectable()
export class TgWebhookValidatorGuard implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    try {
      const body = request.body as SecurePayloadDto<any>;
      console.log(body);
      const c = tgBotMicroValidator(body.lt, body.payload);
      console.log(body.hash, c)
      return body.hash === tgBotMicroValidator(body.lt, body.payload)
    } catch (e) {
      return false;
    }
  }
}
