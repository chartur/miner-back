import { BoostLevels } from '../../enums/boost-levels';
import { BoostDetails } from '../../../../entites/boost-details';

export class ConfigsDto {
  boostDetails: Record<BoostLevels, BoostDetails>;
  periodWithSeconds: number;
  tonByNonoton: number;
}
