import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Boosts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('boosts')
export class BoostController {}
