import { Controller, Get } from '@nestjs/common';
import { appVersion } from './app.config';

@Controller()
export class AppController {
  @Get('version')
  getHello(): string {
    return `App version is: ${appVersion}`;
  }
}
