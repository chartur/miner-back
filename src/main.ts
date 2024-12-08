import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ParseUserGuard } from './shared/guards/parse-user.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import { viewPath } from "./app.config";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    await AppModule.register(),
  );

  app.useGlobalGuards(app.get(ParseUserGuard));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setViewEngine('nunjucks');
  nunjucks.configure(viewPath, {
    express: app,
    autoescape: true,
    watch: true,
    noCache: process.env.NODE_ENV === 'local',
  });

  await app.listen(process.env.PORT || 9000);
}
bootstrap();
