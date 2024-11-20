import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../../entites/task.entity';
import { UserEntity } from '../../entites/user.entity';
import { WalletEntity } from '../../entites/wallet.entity';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity, WalletEntity])],
})
export class TaskModule {}
