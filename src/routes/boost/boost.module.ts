import { Module } from '@nestjs/common';
import { BoostController } from './boost.controller';
import { BoostService } from './boost.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostEntity } from '../../entites/boost.entity';
import { UserEntity } from '../../entites/user.entity';
import { GlobalServiceModule } from '../../shared/global-service.module';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '../../clients/clients.module';

@Module({
  controllers: [BoostController],
  providers: [BoostService],
  imports: [
    GlobalServiceModule,
    ConfigModule,
    ClientsModule,
    TypeOrmModule.forFeature([BoostEntity, UserEntity, InvoiceEntity]),
  ],
})
export class BoostModule {}
