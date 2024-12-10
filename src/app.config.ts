import { join } from 'path';

export const appVersion = '2.6.0';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'miner-app', 'dist', 'browser')
    : join(__dirname, '..', 'app');

export const assetsPath =
  process.env.MODE === 'local'
    ? join(__dirname, 'assets')
    : join(__dirname, 'assets');
