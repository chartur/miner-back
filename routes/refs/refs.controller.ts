import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefEntity } from '../../entites/ref.entity';
import { RefsService } from './refs.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';

@ApiTags('refs')
@Controller('refs')
export class RefsController {
  constructor(private refsService: RefsService) {}

  @ApiResponse({
    status: 201,
    type: [RefEntity],
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Get('/my')
  public getMyRefs(@AuthUser() user: UserEntity): Promise<RefEntity[]> {
    return this.refsService.getMyRefs(user.id);
  }
}
