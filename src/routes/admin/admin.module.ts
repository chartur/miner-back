import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { ValidationExceptionFilter } from '../../core/filters/admin-form-validation-filter';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../../entites/admin.entity';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from '../../entites/user.entity';

@Module({
  controllers: [AuthController, DashboardController, UsersController],
  imports: [TypeOrmModule.forFeature([AdminEntity, UserEntity])],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AdminModule {}
