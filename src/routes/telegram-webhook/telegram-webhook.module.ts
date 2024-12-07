import { Module } from '@nestjs/common';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { BoostService } from '../boost/boost.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostEntity } from '../../entites/boost.entity';
import { UserEntity } from '../../entites/user.entity';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { BoostDetailsService } from '../../shared/services/boost-details.service';
import { TransactionsService } from '../../shared/services/transactions.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '../../clients/clients.module';
import { BoostDetails } from '../../entites/boost-details';
import { TransactionEntity } from '../../entites/transaction.entity';
import { TaskEntity } from '../../entites/task.entity';
import { TelegramWebhookService } from './telegram-webhook.service';
import { TaskService } from "../task/task.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoostEntity,
      UserEntity,
      InvoiceEntity,
      BoostDetails,
      TransactionEntity,
      TaskEntity,
    ]),
    ConfigModule,
    ClientsModule,
  ],
  controllers: [TelegramWebhookController],
  providers: [
    TelegramWebhookService,
    BoostService,
    BoostDetailsService,
    TransactionsService,
    TaskService,
  ],
})
export class TelegramWebhookModule {}
