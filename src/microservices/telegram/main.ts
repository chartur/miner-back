import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { TelegramModule } from './telegram.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TelegramModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(process.env.TELEGRAM_MICROSERVICE_PORT),
      },
    },
  );

  await app.listen();
}
bootstrap();
