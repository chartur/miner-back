import { Module } from '@nestjs/common';
import { TelegramClient } from './telegram.client';
import { ClientsModule as GlobalClientsModule } from '@nestjs/microservices/module/clients.module';
import { Transport } from '@nestjs/microservices';

@Module({
  providers: [TelegramClient],
  exports: [TelegramClient],
  imports: [
    GlobalClientsModule.registerAsync([
      {
        name: 'TELEGRAM_BOT',
        useFactory: () => {
          return {
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: parseInt(process.env.TELEGRAM_MICROSERVICE_PORT),
            },
          };
        },
      },
    ]),
  ],
})
export class ClientsModule {}
