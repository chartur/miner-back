import { DynamicModule, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ParseUserGuard } from './shared/guards/parse-user.guard';

import { getModules } from './modules';

@Module({})
export class AppModule {
  static async register(): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: getModules(),
      providers: [JwtService, ParseUserGuard],
    };
  }
}
