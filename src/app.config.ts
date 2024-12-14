import { join } from 'path';

export const appVersion = '2.6.6';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'miner-app', 'dist', 'browser')
    : join(__dirname, '..', 'app');

export const viewPath = join(__dirname, 'views');

export const assetsPath = join(__dirname, 'assets');
