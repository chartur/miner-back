import { Injectable, OnModuleInit } from '@nestjs/common';
import { BoostLevels } from '../../core/models/enums/boost-levels';
import { BoostDetails } from '../../entites/boost-details';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoadBoostDetails } from '../../core/models/dto/response/load-boost-details';

@Injectable()
export class BoostDetailsService implements OnModuleInit {
  private boostDetails: Partial<LoadBoostDetails> = {};

  constructor(
    @InjectRepository(BoostDetails)
    private boostDetailsRepository: Repository<BoostDetails>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadBoostDetails();
  }

  public get details(): LoadBoostDetails {
    return this.boostDetails as LoadBoostDetails;
  }

  public getDetail(key: BoostLevels): BoostDetails {
    return this.boostDetails[key];
  }

  private async loadBoostDetails(): Promise<void> {
    const details = await this.boostDetailsRepository.find();
    this.boostDetails = details.reduce((accumulator, current) => {
      accumulator[current.name] = current;
      return accumulator;
    }, this.boostDetails);
  }
}
