import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RefsModule } from './refs/refs.module';
import { WalletModule } from './wallet/wallet.module';
import { BoostModule } from './boost/boost.module';
import { ConfigModule } from './config/config.module';
import { TaskModule } from './task/task.module';
import { TelegramWebhookModule } from './telegram-webhook/telegram-webhook.module';
import { ApiController } from './api.controller';

@Module({
  imports: [
    UsersModule,
    RefsModule,
    WalletModule,
    BoostModule,
    ConfigModule,
    TaskModule,
    TelegramWebhookModule,
  ],
  controllers: [ApiController],
})
export class ApiModule {}
