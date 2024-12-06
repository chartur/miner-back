import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { BoostDetailsService } from './services/boost-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostDetails } from '../entites/boost-details';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionsService } from './services/transactions.service';
import { TransactionEntity } from '../entites/transaction.entity';
import { InvoiceEntity } from '../entites/invoice.entity';
import { AppTonClient } from './services/app-ton-client.service';
import { SettingsEntity } from '../entites/settings.entity';
import { SettingsService } from './services/settings.service';

@Module({
  providers: [
    SettingsService,
    BoostDetailsService,
    TransactionsService,
    {
      provide: AppTonClient,
      useFactory: async (
        configService: ConfigService,
        httpService: HttpService,
      ): Promise<AppTonClient> => {
        const config = {
          endpoint: configService.get<string>('TON_CLIENT_URL'),
          apiKey: configService.get<string>('TON_CLIENT_API_KEY'),
          address: configService.get<string>('TELEGRAM_WALLET_ADDRESS'),
        };
        return new AppTonClient(httpService, config);
      },
      inject: [ConfigService, HttpService],
    },
  ],
  exports: [
    BoostDetailsService,
    TransactionsService,
    AppTonClient,
    SettingsService,
  ],
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      BoostDetails,
      TransactionEntity,
      InvoiceEntity,
      SettingsEntity,
    ]),
  ],
})
export class GlobalServiceModule {}
