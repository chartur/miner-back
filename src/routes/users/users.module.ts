import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entites/user.entity';
import { RefsService } from '../refs/refs.service';
import { RefEntity } from '../../entites/ref.entity';
import { AuthService } from '../../shared/services/auth.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { GlobalServiceModule } from '../../shared/global-service.module';
import { WalletEntity } from '../../entites/wallet.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RefsService, AuthService, AuthGuard],
  imports: [
    GlobalServiceModule,
    TypeOrmModule.forFeature([UserEntity, RefEntity, WalletEntity]),
  ],
})
export class UsersModule {}
