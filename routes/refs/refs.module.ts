import { Module } from '@nestjs/common';
import { RefsController } from './refs.controller';
import { RefsService } from './refs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entites/user.entity';
import { RefEntity } from '../../entites/ref.entity';

@Module({
  controllers: [RefsController],
  providers: [RefsService],
  imports: [TypeOrmModule.forFeature([UserEntity, RefEntity])],
})
export class RefsModule {}
