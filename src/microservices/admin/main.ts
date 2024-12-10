import session from 'express-session';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as nunjucks from 'nunjucks';
import { AdminModule } from './admin.module';
import { NextFunction, Request, Response } from 'express';
import { assetsPath, viewPath } from '../../app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AdminModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useStaticAssets(assetsPath, {
    prefix: '/assets',
  });
  app.enableCors();

  app.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.setViewEngine('nunjucks');
  const nEnv = nunjucks.configure(viewPath, {
    express: app,
    autoescape: true,
    watch: true,
  });
  nEnv.addFilter('timpstampable', (url) => {
    const urlObj = new URL(url);
    urlObj.searchParams.append('ts', Date.now().toString());
    return urlObj.toString();
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

  await app.listen(process.env.ADMIN_MICROSERVICE_PORT);
}
bootstrap();
