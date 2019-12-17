import { Transaction } from 'src/app/models/transaction.model';

export interface TransactionParser {
    name: string;
    parse(input: File): Promise<Transaction[]>;
}