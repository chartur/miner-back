import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefEntity } from '../../entites/ref.entity';
import { RefsService } from './refs.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';
import { RefsProfitDto } from '../../core/models/dto/response/refs-profit.dto';
import { WalletEntity } from '../../entites/wallet.entity';
import { MyRefsDto } from "../../core/models/dto/response/my-refs.dto";

@ApiTags('refs')
@Controller('refs')
export class RefsController {
  constructor(private refsService: RefsService) {}

  @ApiResponse({
    status: 201,
    type: MyRefsDto,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Get('/my')
  public getMyRefs(@AuthUser() user: UserEntity): Promise<MyRefsDto> {
    return this.refsService.getMyRefs(user.id);
  }

  @ApiResponse({
    status: 201,
    type: RefsProfitDto,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Get('/profit')
  public getRefsProfit(@AuthUser() user: UserEntity): Promise<RefsProfitDto> {
    return this.refsService.getRefsProfit(user);
  }

  @ApiResponse({
    status: 201,
    type: void 0,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Post('/collect')
  public collectRefsProfit(
    @AuthUser() user: UserEntity,
  ): Promise<WalletEntity> {
    return this.refsService.collectRefsProfit(user);
  }
}
