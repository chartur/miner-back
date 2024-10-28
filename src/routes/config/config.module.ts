import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { GlobalServiceModule } from '../../shared/global-service.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostDetails } from '../../entites/boost-details';
import { ConfigModule as GlobalConfigModule } from '@nestjs/config';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  imports: [
    GlobalServiceModule,
    GlobalConfigModule,
    TypeOrmModule.forFeature([BoostDetails]),
  ],
})
export class ConfigModule {}
