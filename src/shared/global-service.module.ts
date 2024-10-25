import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [HttpModule],
})
export class GlobalServiceModule {}
