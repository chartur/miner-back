import { BoostLevels } from '../../enums/boost-levels';
import { BoostDetails } from '../../../../entites/boost-details';

export class LoadBoostDetails {
  [BoostLevels.USUAL]: BoostDetails;
  [BoostLevels.MINI]: BoostDetails;
  [BoostLevels.MAJOR]: BoostDetails;
  [BoostLevels.MEGA]: BoostDetails;
}
