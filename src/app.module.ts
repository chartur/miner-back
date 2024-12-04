import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { JwtService } from '@nestjs/jwt';
import { ParseUserGuard } from './shared/guards/parse-user.guard';

import { getModules } from './modules';

@Module({
  imports: getModules(),
  providers: [JwtService, ParseUserGuard],
  controllers: [AppController],
})
export class AppModule {}
