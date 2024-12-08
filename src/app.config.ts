import { join } from 'path';

export const appVersion = '2.5.1';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'miner-app', 'dist', 'browser')
    : join(__dirname, '..', 'app');

export const viewPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', 'views')
    : join(__dirname, 'views');

export const assetsPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', 'assets')
    : join(__dirname, 'assets');
