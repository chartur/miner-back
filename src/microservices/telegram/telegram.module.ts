import { Module } from '@nestjs/common';
import { TelegramRepository } from './telegram.repository';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramController } from './telegram.controller';
import { TelegramListener } from './telegram.listener';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [TelegramRepository, TelegramListener],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.MODE || 'local'}.env`,
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_KEY,
    }),
    HttpModule
  ],
  exports: [TelegramRepository, TelegramListener],
  controllers: [TelegramController],
})
export class TelegramModule {}
