import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { Repository, LessThan } from 'typeorm';
import { MasterInstance } from 'pm2-master-process';

@Injectable()
export class InvoicesCron {
  private logger = new Logger(InvoicesCron.name);

  constructor(
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
  ) {}

  @Cron('*/45 * * * *')
  @MasterInstance()
  public async handleCron(): Promise<void> {
    this.logger.log('[InvoicesCron] Cron started');
    try {
      const deletedDetails = await this.invoiceEntityRepository.delete({
        expirationDateTime: LessThan(new Date()),
      });
      this.logger.log('[InvoicesCron] Deleted expired invoices', {
        deletedDetails,
      });
    } catch (error) {
      this.logger.log('[InvoicesCron] Failure: Deleted expired invoices', {
        error,
      });
    }
  }
}
