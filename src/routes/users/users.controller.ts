import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SyncUserDto } from '../../core/models/dto/sync-user.dto';
import { AuthUserDto } from '../../core/models/dto/response/auth-user.dto';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({
    status: 201,
    type: AuthUserDto,
    description: 'The record has been successfully created/updated.',
  })
  @ApiResponse({ status: 400, description: 'Wrong data' })
  @ApiQuery({ name: 'ref', required: false, type: String })
  @Put('sync')
  public sync(
    @Body() body: SyncUserDto,
    @Query('ref') ref?: string,
  ): Promise<AuthUserDto> {
    return this.usersService.sync(body, ref);
  }

  @Put('sync/test')
  public syncTest(@Query('tUserId') tUserId: string): Promise<AuthUserDto> {
    return this.usersService.syncTest(tUserId);
  }

  @ApiResponse({
    status: 201,
    type: AuthUserDto,
    description: 'The record has been successfully loaded.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  public me(@AuthUser() authUser: UserEntity): Promise<UserEntity> {
    return this.usersService.me(authUser);
  }

  @ApiResponse({
    status: 200,
    type: void 0,
    description: 'The user already subscribed',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('check-subscription')
  public isUserSubscribed(@AuthUser() authUser: UserEntity) {
    return this.usersService.isUserSubscribed(authUser);
  }
}
