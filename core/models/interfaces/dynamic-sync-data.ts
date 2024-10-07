import { SyncUserDto } from '../dto/sync-user.dto';

export class DynamicSyncData extends SyncUserDto {
  [key: string]: any;
}
