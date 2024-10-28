import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import { HttpModule } from '@nestjs/axios';
import { BoostDetailsService } from './services/boost-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostDetails } from '../entites/boost-details';

@Module({
  providers: [TelegramService, BoostDetailsService],
  exports: [TelegramService, BoostDetailsService],
  imports: [HttpModule, TypeOrmModule.forFeature([BoostDetails])],
})
export class GlobalServiceModule {}
