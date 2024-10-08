import { Module } from '@nestjs/common';
import { ENTITIES } from '../entites';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../routes/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ParseUserGuard } from '../shared/guards/parse-user.guard';
import { RefsModule } from '../routes/refs/refs.module';
import { WalletModule } from '../routes/wallet/wallet.module';
import { BoostModule } from "../routes/boost/boost.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.mode || 'local'}.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
      entities: ENTITIES,
      // logging: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '6h' },
    }),
    UsersModule,
    RefsModule,
    WalletModule,
    BoostModule,
  ],
  providers: [AppService, JwtService, ParseUserGuard],
  controllers: [AppController],
})
export class AppModule {}
