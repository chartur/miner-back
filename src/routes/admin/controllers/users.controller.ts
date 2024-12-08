import {
  Controller,
  Get,
  Param,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../entites/user.entity';
import { Repository } from 'typeorm';
import { createSessionError } from '../../../utils/create-session-error';
import { Request, Response } from 'express';
import { AdminGuard } from '../../../shared/guards/admin.guard';

@Controller('users')
@UseGuards(AdminGuard)
export class UsersController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  @Get('list')
  @Render('users/list.html')
  async listPage() {
    return {
      users: await this.userEntityRepository.find({}),
    };
  }

  @Get(':id')
  @Render('users/view.html')
  async userViewPage(
    @Param('id') userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.userEntityRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      createSessionError(req, ['User does not exits']);
      res.redirect(req.get('Referrer'));
      return;
    }

    return {
      user,
    };
  }
}
