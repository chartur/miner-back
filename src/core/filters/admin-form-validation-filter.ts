import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createSessionError } from "../../utils/create-session-error";

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ForbiddenException) {
      createSessionError(request, ['You are not signed-in']);
      response.redirect('/sign-in');
      return;
    }

    if (exception instanceof BadRequestException) {
      const referrer = request.get('Referrer');
      const errors = (exception as any).response.message;
      createSessionError(request, errors);
      response.redirect(referrer);
      return;
    }

    return response.redirect('/');
  }
}
