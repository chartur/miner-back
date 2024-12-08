import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AuthUser } from '../../../core/decorators/auth-user';
import { UserEntity } from '../../../entites/user.entity';
import { WalletService } from './wallet.service';
import { WalletEntity } from '../../../entites/wallet.entity';
import { GetCurrencyRateDtoResponse } from '../../../core/models/dto/response/get-currency-rate.dto.response';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class WalletController {
  constructor(private walletService: WalletService) {}

  @ApiResponse({
    status: 201,
    type: WalletEntity,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('/my')
  public getMyWallet(@AuthUser() authUser: UserEntity): Promise<WalletEntity> {
    return this.walletService.getMyWallet(authUser);
  }

  @ApiResponse({
    status: 201,
    type: WalletEntity,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('/claim')
  public claim(@AuthUser() authUser: UserEntity): Promise<WalletEntity> {
    return this.walletService.claim(authUser);
  }

  @ApiResponse({
    status: 201,
    type: GetCurrencyRateDtoResponse,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('/rates')
  public getRates(): Promise<GetCurrencyRateDtoResponse | { error: string }> {
    return this.walletService.getRates();
  }
}
