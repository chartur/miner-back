import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ConfigService } from './config.service';
import { ConfigsDto } from '../../core/models/dto/response/configs.dto';

@ApiTags('Config')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @ApiResponse({
    status: 201,
    type: ConfigsDto,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Get('/')
  public getConfig(): ConfigsDto {
    return this.configService.getConfig();
  }
}
