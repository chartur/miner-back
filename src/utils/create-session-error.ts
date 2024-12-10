import { Request } from 'express';

export const createSessionError = (
  request: Request,
  errors: Array<string>,
  body?: Record<string, any>
): void => {
  request.session['errors_live_time'] = 1;
  request.session['errors'] = errors;
  request.session['oldValues'] = body;
};
