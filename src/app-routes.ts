import { Routes } from '@nestjs/core';
import { ApiModule } from './routes/api/api.module';
import { WalletModule } from './routes/api/wallet/wallet.module';
import { UsersModule } from './routes/api/users/users.module';
import { TelegramWebhookModule } from './routes/api/telegram-webhook/telegram-webhook.module';
import { TaskModule } from './routes/api/task/task.module';
import { RefsModule } from './routes/api/refs/refs.module';
import { ConfigModule } from './routes/api/config/config.module';
import { BoostModule } from './routes/api/boost/boost.module';

export const routes: Routes = [
  {
    path: 'api',
    module: ApiModule,
    children: [
      {
        path: 'wallet',
        module: WalletModule,
      },
      {
        path: 'users',
        module: UsersModule,
      },
      {
        path: 'telegram-webhook-handler',
        module: TelegramWebhookModule,
      },
      {
        path: 'telegram-webhook-handler',
        module: TelegramWebhookModule,
      },
      {
        path: 'tasks',
        module: TaskModule,
      },
      {
        path: 'refs',
        module: RefsModule,
      },
      {
        path: 'refs',
        module: RefsModule,
      },
      {
        path: 'config',
        module: ConfigModule,
      },
      {
        path: 'boosts',
        module: BoostModule,
      },
    ],
  },
];
