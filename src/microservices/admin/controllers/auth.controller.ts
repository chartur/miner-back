import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { SignInDto } from '../../../core/models/dto/admin/sign-in.dto';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from '../../../entites/admin.entity';
import { Repository } from 'typeorm';
import { createSessionError } from '../../../utils/create-session-error';

@Controller()
export class AuthController {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminEntityRepository: Repository<AdminEntity>,
  ) {}

  @Get('')
  indexPage(@Res() res: Response) {
    res.redirect('/sign-in');
  }

  @Get('sign-in')
  signInPage(@Req() req: Request, @Res() res: Response) {
    if (req.session['admin']) {
      res.redirect('/dashboard');
      return;
    }
    res.render('auth/sign-in.html');
  }

  @Post('sign-in')
  async signInAction(
    @Body() body: SignInDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(body);
    const admin = await this.adminEntityRepository.findOne({
      where: { email: body.email },
    });
    if (!admin) {
      createSessionError(req, ['Admin credentials are not found!'], body);
      res.redirect(req.get('Referrer'));
      return;
    }
    if (admin && (await bcrypt.compare(body.password, admin.password))) {
      req.session['admin'] = admin;
    }
    res.redirect('/dashboard');
  }

  @Get('sign-out')
  async logOut(@Req() req: Request, @Res() res: Response) {
    delete req.session['admin'];
    req.session.save();
    res.redirect('/sign-in');
  }
}
