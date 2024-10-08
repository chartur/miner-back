import { Body, Controller, Put, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SyncUserDto } from '../../core/models/dto/sync-user.dto';
import { AuthUserDto } from '../../core/models/dto/response/auth-user.dto';

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
}
