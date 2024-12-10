import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
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
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
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
  async listPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<{ users: Pagination<UserEntity> }> {
    const repo = await this.userEntityRepository.createQueryBuilder();
    const data = await paginate(repo, {
      limit,
      page,
      route: '/users/list',
    });
    return {
      users: data,
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
