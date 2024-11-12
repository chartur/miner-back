import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../entites/transaction.entity';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { GlobalServiceModule } from '../../shared/global-service.module';
import { SettingsEntity } from '../../entites/settings.entity';
import { UserEntity } from '../../entites/user.entity';
import { WalletEntity } from '../../entites/wallet.entity';
import { WalletService } from '../../routes/wallet/wallet.service';
import { BoostEntity } from '../../entites/boost.entity';
import { RefEntity } from '../../entites/ref.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BoostService } from '../../routes/boost/boost.service';
import { TransactionsCron } from './transactions.cron';

@Module({
  providers: [TransactionsCron, WalletService, ConfigService, BoostService],
  imports: [
    GlobalServiceModule,
    HttpModule,
    TypeOrmModule.forFeature([
      TransactionEntity,
      InvoiceEntity,
      SettingsEntity,
      UserEntity,
      WalletEntity,
      BoostEntity,
      RefEntity,
    ]),
  ],
})
export class CronesModule {}
