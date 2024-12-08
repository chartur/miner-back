import { Controller, Get, Render } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('sign-in')
  @Render('auth/sign-in.html')
  signInPage() {
    return {
      test: 'TEST',
    };
  }
}
