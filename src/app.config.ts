import { join } from 'path';

export const appVersion = '1.4.2';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'miner-app', 'dist', 'browser')
    : join(__dirname, '..', 'app');
