import { ParsedTransaction } from '../classes/parsed-transaction';

export interface GetTransactionsDto {
  limit: number;
  transactionsMap: ParsedTransaction[];
  lastTransactionLT?: string;
  lastTransactionHash?: string;
  fromLT?: string;
}
