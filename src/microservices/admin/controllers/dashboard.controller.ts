import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../entites/user.entity';
import { Repository } from 'typeorm';

@Controller('dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  @Get('/')
  @Render('dashboard.html')
  async dashboardPage() {
    const usersCount = await this.userEntityRepository.count();
    return {
      usersCount,
    };
  }
}
