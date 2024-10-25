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
import { RefsService } from '../refs/refs.service';
import { WalletEntity } from '../../entites/wallet.entity';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    private telegramService: TelegramService,
    private authService: AuthService,
    private refsService: RefsService,
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
    const profilePhotoAsync = this.telegramService.getUserProfilePhoto(user.id);
    const profilePhotoFileId: string = (await profilePhotoAsync.next())
      .value as string;

    let userEntity: UserEntity;
    const existingUserData = await this.userEntityRepository.findOne({
      where: {
        tUserId: user.id.toString(),
      },
      relations: ['wallet', 'boost'],
    });
    const newUserData = {
      tUserId: user.id.toString(),
      photoFileId: profilePhotoFileId,
      languageCode: user.language_code as Language,
      firstName: user.first_name,
      lastName: user.last_name,
    };
    if (!profilePhotoFileId) {
      newUserData['photoUrl'] = null;
    }

    if (!existingUserData) {
      const photoUrl = (await profilePhotoAsync.next()).value as string;
      userEntity = await this.userEntityRepository.save({
        ...newUserData,
        photoUrl,
        wallet: new WalletEntity(),
      });
      if (ref) {
        this.refsService.create(userEntity, ref);
      }
    } else {
      if (!existingUserData.wallet) {
        existingUserData.wallet = new WalletEntity();
        await this.userEntityRepository.save(existingUserData);
      }
      const isSame = Object.keys(newUserData).every(
        (key) => existingUserData[key] === newUserData[key],
      );
      if (isSame) {
        userEntity = existingUserData;
      } else {
        const photoUrl = (await profilePhotoAsync.next()).value as string;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        userEntity = await this.userEntityRepository.save({
          ...existingUserData,
          ...newUserData,
          photoUrl,
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photoUrl, ...rest } = userEntity;
    const token = await this.authService.signIn(rest);
    return {
      token,
      user: userEntity,
    };
  }

  public async syncTest(tUserId: string): Promise<AuthUserDto> {
    this.logger.log('[User] sync user data TEST', {
      tUserId,
    });

    const userEntity = await this.userEntityRepository.findOne({
      where: {
        tUserId,
      },
      relations: ['wallet', 'boost'],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photoUrl, ...rest } = userEntity;
    const token = await this.authService.signIn(rest);
    return {
      token,
      user: userEntity,
    };
  }

  public me(authUser: UserEntity): Promise<UserEntity> {
    this.logger.log('[User] get me', {
      authUser,
    });

    return this.userEntityRepository.findOneOrFail({
      where: {
        id: authUser.id,
      },
      relations: ['wallet', 'boost'],
    });
  }

  public async isUserSubscribed(authUser: UserEntity): Promise<boolean> {
    const isSubscribed =
      await this.telegramService.isUserSubscribedToCommunityChannel(
        authUser.tUserId,
      );
    return isSubscribed;
  }
}
