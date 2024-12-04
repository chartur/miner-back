import { join } from 'path';

export const appVersion = '1.4.2';

export const appPath =
  process.env.MODE === 'local'
    ? join(__dirname, '..', '..', 'note-mining', 'dist', 'browser')
    : join(__dirname, '..', 'app');
