import { Module } from '@nestjs/common';
import { ENTITIES } from './entites';
import {
  ConfigModule as GlobalConfigModule,
  ConfigService as GlobalConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './routes/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ParseUserGuard } from './shared/guards/parse-user.guard';
import { RefsModule } from './routes/refs/refs.module';
import { WalletModule } from './routes/wallet/wallet.module';
import { BoostModule } from './routes/boost/boost.module';
import { GlobalServiceModule } from './shared/global-service.module';
import { ConfigModule } from './routes/config/config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronesModule } from './core/crones/crons.module';
import { TaskModule } from './routes/task/task.module';
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    GlobalConfigModule.forRoot({
      envFilePath: `.${process.env.mode || 'local'}.env`,
    }),
    EventEmitterModule.forRoot(),
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
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          migrationsRun: true,
          synchronize: false,
          autoLoadEntities: true,
          entities: ENTITIES,
        };
      },
      inject: [GlobalConfigService],
      // logging: true,
    }),
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '6h' },
    }),
    CronesModule,
    GlobalServiceModule,
    UsersModule,
    RefsModule,
    WalletModule,
    BoostModule,
    ConfigModule,
    TaskModule,
  ],
  providers: [JwtService, ParseUserGuard],
  controllers: [AppController],
})
export class AppModule {}
