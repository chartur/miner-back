import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { AuthUser } from '../../../core/decorators/auth-user';
import { UserEntity } from '../../../entites/user.entity';
import { ActivateBoostDto } from '../../../core/models/dto/activate-boost.dto';
import { InvoiceDto } from '../../../core/models/dto/response/invoice.dto';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { LinkResponseDto } from '../../../core/models/dto/response/link.response.dto';

@ApiTags('Boosts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class BoostController {
  constructor(private boostService: BoostService) {}

  @ApiResponse({
    status: 201,
    type: InvoiceDto,
    description: 'Invoice successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('/invoice')
  public createInvoice(
    @AuthUser() authUser: UserEntity,
    @Body() body: ActivateBoostDto,
  ): Promise<InvoiceDto> {
    return this.boostService.createInvoice(authUser, body);
  }

  @ApiResponse({
    status: 201,
    type: LinkResponseDto,
    description: 'Telegram Invoice link successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('/claim-notification/invoice')
  public getClaimNotificationActivationInvoice(
    @AuthUser() authUser: UserEntity,
  ): Promise<LinkResponseDto> {
    return this.boostService.getClaimNotificationActivationInvoice(authUser);
  }
}
