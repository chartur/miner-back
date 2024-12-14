import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../../../entites/task.entity';
import { UserEntity } from '../../../entites/user.entity';
import { WalletEntity } from '../../../entites/wallet.entity';
import { InvoiceEntity } from '../../../entites/invoice.entity';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '../../../clients/clients.module';
import { RefEntity } from '../../../entites/ref.entity';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [
    ConfigModule,
    ClientsModule,
    TypeOrmModule.forFeature([
      TaskEntity,
      UserEntity,
      WalletEntity,
      InvoiceEntity,
      RefEntity,
    ]),
  ],
})
export class TaskModule {}
