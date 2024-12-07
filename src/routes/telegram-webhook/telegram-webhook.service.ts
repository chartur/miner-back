import { Injectable, Logger } from '@nestjs/common';
import { BoostService } from '../boost/boost.service';
import { SuccessPayment } from '../../core/models/interfaces/success-payment';
import { InvoiceAction } from '../../core/models/enums/invoice-action';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { Repository } from 'typeorm';
import { TaskService } from '../task/task.service';

@Injectable()
export class TelegramWebhookService {
  private logger = new Logger(TelegramWebhookService.name);

  constructor(
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
    private boostService: BoostService,
    private taskService: TaskService,
  ) {}

  public async handleOrderCreatedEvent(payload: SuccessPayment): Promise<void> {
    const invoice = await this.invoiceEntityRepository.findOne({
      where: {
        id: payload.invoice_payload,
      },
      relations: {
        user: {
          wallet: true,
          settings: true,
        },
      },
    });

    if (!invoice) {
      this.logger.log('[Boost] successful payment: Invoice not found', {
        invoiceId: payload.invoice_payload,
      });
      return;
    }
    switch (invoice.action) {
      case InvoiceAction.CLAIM_NOTIFICATION:
        return this.boostService.claimNotificationPaymentSuccess(invoice);
      case InvoiceAction.DAILY_STAR_INVOICE:
        return this.taskService.dailyStarInvoiceTaskComplete(invoice);
    }
  }
}
