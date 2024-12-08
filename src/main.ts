import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ParseUserGuard } from './shared/guards/parse-user.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import { viewPath } from './app.config';
import session from 'express-session';
import { NextFunction, Request, Response } from 'express';
import { isMasterProcess } from 'pm2-master-process';

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

  if (await isMasterProcess()) {
    app.use(
      session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.setViewEngine('nunjucks');
    nunjucks.configure(viewPath, {
      express: app,
      autoescape: true,
      watch: true,
    });
    app.use((req, res, next) => {
      res.locals._session = req.session;
      next();
    });
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        if (req.session['errors_live_time'] > 0) {
          req.session['errors_live_time']--;
          req.session.save();
        } else if (req.session['errors_live_time'] === 0) {
          delete req.session['errors'];
          delete req.session['oldValues'];
          req.session.save();
        }
      });

      next();
    });
  }

  await app.listen(process.env.PORT || 9000);
}
bootstrap();
