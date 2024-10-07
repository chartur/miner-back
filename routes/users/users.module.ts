import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entites/user.entity';
import { RefsService } from '../refs/refs.service';
import { RefEntity } from '../../entites/ref.entity';
import { TelegramService } from '../../shared/services/telegram.service';
import { AuthService } from '../../shared/services/auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RefsService, TelegramService, AuthService],
  imports: [TypeOrmModule.forFeature([UserEntity, RefEntity])],
})
export class UsersModule {}
