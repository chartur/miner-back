import { DataSource } from 'typeorm';
import { ENTITIES } from './src/entites';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config({
  path: `.${process.env.mode || 'local'}.env`,
});

const configService: ConfigService = new ConfigService();

const DBConfig = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  entities: ENTITIES,
};

const dataSource = new DataSource(DBConfig as any);
dataSource.initialize();
export default dataSource;
