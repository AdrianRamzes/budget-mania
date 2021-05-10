import { Transaction } from 'src/app/models/transaction.model';

export class TransactionDisplayItem {
    selected = false;
    dateString: string;
    information: string;
    accountName: string;
    amount: number;
    originalAmount: number;
    originalCurrencyCode: string;
    currencyCode: string;
}
