import { join } from 'path';

export const appVersion = '2.3.1';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'miner-app', 'dist', 'browser')
    : join(__dirname, '..', 'app');
