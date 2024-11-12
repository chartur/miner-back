import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BoostService } from './boost.service';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';
import { ActivateBoostDto } from '../../core/models/dto/activate-boost.dto';
import { InvoiceDto } from '../../core/models/dto/response/invoice.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Boosts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('boosts')
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
}
