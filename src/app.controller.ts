import { Controller, Get } from '@nestjs/common';
import { appVersion } from './app-version';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return `App version is: ${appVersion}`;
  }
}
