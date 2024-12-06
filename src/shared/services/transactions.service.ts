import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../entites/transaction.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InvoiceDto } from '../../core/models/dto/response/invoice.dto';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { beginCell, toNano } from 'ton';
import { UserEntity } from '../../entites/user.entity';
import { InvoiceAction } from '../../core/models/enums/invoice-action';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionEntityRepository: Repository<TransactionEntity>,
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
    private configService: ConfigService,
  ) {}

  public async createInvoice(
    userId: string,
    amount: number,
    action: InvoiceAction,
    details?: string,
  ): Promise<InvoiceDto> {
    const invoiceData = this.invoiceEntityRepository.create({
      amount,
      action,
      details,
    });
    invoiceData.user = { id: userId } as UserEntity;
    const invoice = await this.invoiceEntityRepository.save(invoiceData);
    await this.invoiceEntityRepository.save(invoiceData);
    const payload = this.prepareTransactionPayload(invoice.id);
    return {
      payload,
      amount: toNano(invoice.amount).toString(),
      // amount: toNano(0.05).toString(),
      address: this.configService.get<string>('TELEGRAM_WALLET_ADDRESS'),
    };
  }

  public prepareTransactionPayload(invoiceToken: string): string {
    return beginCell()
      .storeUint(0, 32)
      .storeStringTail(invoiceToken)
      .endCell()
      .toBoc()
      .toString('base64');
  }
}
