import * as crypto from 'crypto';
import { DynamicSyncData } from '../core/models/interfaces/dynamic-sync-data';

export const telegramDataValidator = (data: DynamicSyncData): boolean => {
  const { hash, ...rest } = data;

  const keys = Object.keys(rest).sort();
  const itemsString = keys
    .map((key) => {
      let value = rest[key];
      if (key === 'user') {
        value = JSON.stringify(rest[key]);
      }
      return key + '=' + value;
    })
    .join('\n');

  const secret_key = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_KEY)
    .digest();
  const calculated_hash = crypto
    .createHmac('sha256', secret_key)
    .update(itemsString)
    .digest('hex');

  return calculated_hash === hash;
};
