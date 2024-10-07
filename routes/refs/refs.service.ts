import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entites/user.entity';
import { Repository } from 'typeorm';
import { RefEntity } from '../../entites/ref.entity';

@Injectable()
export class RefsService {
  private logger: Logger = new Logger(RefsService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(RefEntity)
    private refEntityRepository: Repository<RefEntity>,
  ) {}

  public async create(
    referralUser: UserEntity,
    refId: string,
  ): Promise<RefEntity> {
    this.logger.log('[Refs] create ref', {
      referralUser,
      refId,
    });

    if (!refId) {
      throw new BadRequestException();
    }

    const referrerUser = await this.userEntityRepository.findOneOrFail({
      where: {
        tUserId: refId,
      },
    });

    const ref = this.refEntityRepository.create({
      referrer: referrerUser,
      referral: referralUser,
    });

    return this.refEntityRepository.save(ref);
  }

  public getMyRefs(userId: string): Promise<RefEntity[]> {
    this.logger.log('[Refs] get user refs', {
      userId,
    });

    return this.refEntityRepository.find({
      where: {
        referrer: {
          id: userId,
        },
      },
      relations: ['referral', 'referrer'],
    });
  }
}
