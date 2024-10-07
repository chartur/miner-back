import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../entites/user.entity';
import { SyncUserDto } from '../../core/models/dto/sync-user.dto';
import { telegramDataValidator } from '../../utils/telegram-data-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramService } from '../../shared/services/telegram.service';
import { Language } from '../../core/models/enums/language';
import { AuthService } from '../../shared/services/auth.service';
import { AuthUserDto } from '../../core/models/dto/response/auth-user.dto';
import { DynamicSyncData } from '../../core/models/interfaces/dynamic-sync-data';
import { RefsService } from "../refs/refs.service";

@Injectable()
export class UsersService {
  private logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    private telegramService: TelegramService,
    private authService: AuthService,
    private refsService: RefsService
  ) {}

  public async sync(syncData: SyncUserDto, ref?: string): Promise<AuthUserDto> {
    this.logger.log('[User] sync user data', {
      body: syncData,
      ref,
    });

    const isValidUser = telegramDataValidator(syncData as DynamicSyncData);
    if (!isValidUser) {
      throw new BadRequestException();
    }

    const { user } = syncData;
    const profilePhoto = await this.telegramService.getUserProfilePhoto(
      user.id,
    );

    let userEntity: UserEntity;
    const existingUserData = await this.userEntityRepository.findOne({
      where: {
        tUserId: user.id.toString(),
      },
    });
    const newUserData = {
      tUserId: user.id.toString(),
      photoUrl: profilePhoto,
      languageCode: user.language_code as Language,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    if (!existingUserData) {
      userEntity = await this.userEntityRepository.save(newUserData);
      if (ref) {
        this.refsService.create(userEntity, ref);
      }
    } else {
      const isSame = Object.keys(newUserData).every(
        (key) => existingUserData[key] === newUserData[key],
      );
      if (isSame) {
        userEntity = existingUserData;
      } else {
        userEntity = await this.userEntityRepository.save({
          ...existingUserData,
          ...newUserData,
        });
      }
    }

    const token = await this.authService.signIn(userEntity);
    return {
      token,
      user: userEntity,
    };
  }
}
