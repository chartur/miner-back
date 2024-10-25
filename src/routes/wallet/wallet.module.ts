import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from '../../entites/wallet.entity';
import { UserEntity } from '../../entites/user.entity';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { BoostEntity } from '../../entites/boost.entity';
import { GlobalServiceModule } from '../../shared/global-service.module';
import { HttpModule } from '@nestjs/axios';
import { RefEntity } from '../../entites/ref.entity';
import { RefsService } from "../refs/refs.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, AuthGuard, RefsService],
  imports: [
    GlobalServiceModule,
    HttpModule,
    TypeOrmModule.forFeature([
      WalletEntity,
      UserEntity,
      BoostEntity,
      UserEntity,
      RefEntity,
    ]),
  ],
})
export class WalletModule {}
