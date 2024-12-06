import { ConfigModule as GlobalConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService as GlobalConfigService } from '@nestjs/config/dist/config.service';
import { ENTITIES } from './entites';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { appPath } from './app.config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './routes/users/users.module';
import { RefsModule } from './routes/refs/refs.module';
import { WalletModule } from './routes/wallet/wallet.module';
import { BoostModule } from './routes/boost/boost.module';
import { ConfigModule } from './routes/config/config.module';
import { TaskModule } from './routes/task/task.module';
import { GlobalServiceModule } from './shared/global-service.module';
import { TelegramWebhookModule } from './routes/telegram-webhook/telegram-webhook.module';
import { CronesModule } from './core/crones/crons.module';

export const getModules = () => {
  const modules = [
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
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '6h' },
    }),
    ServeStaticModule.forRoot({
      rootPath: appPath,
      exclude: ['/api*'],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    RefsModule,
    WalletModule,
    BoostModule,
    ConfigModule,
    TaskModule,
    GlobalServiceModule,
    TelegramWebhookModule,
  ];

  if (JSON.parse(process.env.RUN_CRON)) {
    modules.push(CronesModule);
  }

  return modules;
};
