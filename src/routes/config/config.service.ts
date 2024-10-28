import { Injectable, Logger } from '@nestjs/common';
import { ConfigsDto } from '../../core/models/dto/response/configs.dto';
import { ConfigService as GlobalConfigService } from '@nestjs/config';
import { BoostDetailsService } from '../../shared/services/boost-details.service';

@Injectable()
export class ConfigService {
  private logger = new Logger(ConfigService.name);

  constructor(
    private globalConfigService: GlobalConfigService,
    private boostDetailsService: BoostDetailsService,
  ) {}

  public getConfig(): ConfigsDto {
    this.logger.log('[Config] load configs');

    return {
      boostDetails: this.boostDetailsService.details,
      tonByNonoton: this.globalConfigService.get<number>('TON_BY_NONOTON'),
      periodWithSeconds: this.globalConfigService.get<number>(
        'PERIOD_WITH_SECONDS',
      ),
    };
  }
}
