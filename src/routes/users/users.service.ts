import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../entites/user.entity';
import { SyncUserDto } from '../../core/models/dto/sync-user.dto';
import { telegramDataValidator } from '../../utils/telegram-data-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/models/enums/language';
import { AuthService } from '../../shared/services/auth.service';
import { AuthUserDto } from '../../core/models/dto/response/auth-user.dto';
import { DynamicSyncData } from '../../core/models/interfaces/dynamic-sync-data';
import { RefsService } from '../refs/refs.service';
import { WalletEntity } from '../../entites/wallet.entity';
import { UserSettingsEntity } from '../../entites/user-settings.entity';
import { TelegramClient } from '../../clients/telegram.client';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    private telegramClient: TelegramClient,
    private authService: AuthService,
    private refsService: RefsService,
  ) {}

  public async sync(syncData: SyncUserDto, ref?: string): Promise<AuthUserDto> {
    this.logger.log('[User] sync user data', {
      body: syncData,
      ref,
    });
    const data = syncData as DynamicSyncData;
    const isValidUser = telegramDataValidator(data.initData, data.hash);
    if (!isValidUser) {
      throw new BadRequestException();
    }

    const { user } = syncData;

    let userEntity: UserEntity;
    const existingUserData = await this.userEntityRepository.findOne({
      where: {
        tUserId: user.id.toString(),
      },
      relations: ['wallet', 'boosts', 'settings'],
    });
    const newUserData = {
      tUserId: user.id.toString(),
      languageCode: user.language_code as Language,
      firstName: user.first_name,
      lastName: user.last_name,
      photoUrl: user.photo_url,
    };

    if (!existingUserData) {
      userEntity = await this.userEntityRepository.save({
        ...newUserData,
        wallet: new WalletEntity(),
        settings: new UserSettingsEntity(),
      });
      await this.userEntityRepository.save(userEntity);
      if (ref) {
        this.refsService.create(userEntity, ref);
      }
    } else {
      let needToUpdate = false;
      if (!existingUserData.wallet) {
        existingUserData.wallet = new WalletEntity();
        needToUpdate = true;
      }
      if (!existingUserData.settings) {
        existingUserData.settings = new UserSettingsEntity();
        needToUpdate = true;
      }
      if (needToUpdate) {
        await this.userEntityRepository.save(existingUserData);
      }
      const isSame = Object.keys(newUserData).every(
        (key) => existingUserData[key] === newUserData[key],
      );
      if (isSame) {
        userEntity = existingUserData;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        userEntity = await this.userEntityRepository.save({
          ...existingUserData,
          ...newUserData,
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { wallet, boosts, settings, ...rest } = userEntity;
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
      relations: ['wallet', 'boosts'],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { wallet, boosts, ...rest } = userEntity;
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
      relations: ['wallet', 'boosts', 'settings'],
    });
  }

  public async isUserSubscribed(authUser: UserEntity): Promise<boolean> {
    return this.telegramClient.isUserSubscribedToCommunityChannel(
      authUser.tUserId,
    );
  }
}
