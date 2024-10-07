import { UserEntity } from '../../../entites/user.entity';
import { RefUserTypes } from '../enums/ref-user-types';

export interface ReferralUsersMap {
  [RefUserTypes.REFERRER]: UserEntity;
  [RefUserTypes.REFERRAL]: UserEntity;
}
