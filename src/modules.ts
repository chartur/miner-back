import { ConfigModule as GlobalConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService as GlobalConfigService } from '@nestjs/config/dist/config.service';
import { ENTITIES } from './entites';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalServiceModule } from './shared/global-service.module';
import { CronesModule } from './core/crones/crons.module';
import { AdminModule } from './routes/admin/admin.module';
import { ApiModule } from './routes/api/api.module';
import { RouterModule } from '@nestjs/core';
import { routes } from './app-routes';
import { appPath, assetsPath } from './app.config';
import { ServeStaticModule } from '@nestjs/serve-static';

export const getModules = () => {
  const modules = [
    RouterModule.register(routes),
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
      rootPath: assetsPath,
      serveRoot: '/public',
      exclude: ['/api/*', '/admin/*', '/favicon.ico'],
    }),
    ServeStaticModule.forRoot({
      rootPath: appPath,
      exclude: ['/api/*', '/admin/*', '/public/*', 'favicon.ico'],
    }),
    ScheduleModule.forRoot(),
    GlobalServiceModule,
    ApiModule,
    AdminModule,
  ];

  if (JSON.parse(process.env.RUN_CRON)) {
    modules.push(CronesModule);
  }

  return modules;
};
