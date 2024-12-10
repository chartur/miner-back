import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { ValidationExceptionFilter } from '../../core/filters/admin-form-validation-filter';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { ConfigModule as GlobalConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService as GlobalConfigService } from '@nestjs/config/dist/config.service';
import { ENTITIES } from '../../entites';

@Module({
  controllers: [AuthController, DashboardController, UsersController],
  imports: [
    GlobalConfigModule.forRoot({
      envFilePath: `.${process.env.MODE || 'local'}.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [GlobalConfigModule],
      useFactory: (config: GlobalConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          synchronize: false,
          autoLoadEntities: true,
          entities: ENTITIES,
        };
      },
      inject: [GlobalConfigService],
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AdminModule {}
