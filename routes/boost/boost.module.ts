import { Module } from '@nestjs/common';
import { BoostController } from './boost.controller';
import { BoostService } from './boost.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostEntity } from '../../entites/boost.entity';

@Module({
  controllers: [BoostController],
  providers: [BoostService],
  imports: [TypeOrmModule.forFeature([BoostEntity])],
})
export class BoostModule {}
