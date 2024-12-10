import { Controller, Get } from '@nestjs/common';
import { appVersion } from '../../app.config';

@Controller()
export class ApiController {
  @Get('version')
  getHello(): string {
    return `App version is: ${appVersion}`;
  }
}
