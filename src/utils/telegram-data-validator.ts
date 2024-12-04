import * as crypto from 'crypto';
import { URLSearchParams } from 'node:url';

export const telegramDataValidator = (
  initialData: string,
  hash: string,
): boolean => {
  const url = new URLSearchParams(initialData);
  url.delete('hash');
  url.sort();
  const data = [];
  for (const [key, value] of url.entries()) {
    data.push(`${key}=${value}`);
  }
  const dataString = data.join('\n');

  const secret_key = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_KEY)
    .digest();

  const calculated_hash = crypto
    .createHmac('sha256', secret_key)
    .update(dataString)
    .digest('hex');

  return calculated_hash === hash;
};

export const tgBotMicroValidator = (
  date: number,
  data: any,
): string => {

  const payload = {
    lt: date,
    data,
  };

  const secret_key = crypto
    .createHmac('sha256', process.env.SECRET_KEY)
    .update(process.env.TELEGRAM_BOT_KEY)
    .digest();

  return crypto
    .createHmac('sha256', secret_key)
    .update(JSON.stringify(payload))
    .digest('hex');
};
