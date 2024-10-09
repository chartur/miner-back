import { Injectable, Logger } from '@nestjs/common';
import { BoostEntity } from '../../entites/boost.entity';
import { UserEntity } from '../../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoostService {
  private logger: Logger = new Logger(BoostService.name);

  constructor(
    @InjectRepository(BoostEntity)
    private boostEntityRepository: Repository<BoostEntity>,
  ) {}

  public getUserBoost(authUser: UserEntity): Promise<BoostEntity | null> {
    this.logger.log('[Boost] get user boost', {
      authUser,
    });

    return this.boostEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
  }
}
