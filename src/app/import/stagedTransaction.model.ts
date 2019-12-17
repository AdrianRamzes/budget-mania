import { Transaction } from '../models/transaction.model';

export class StagedTransaction {
    transaction: Transaction;
    foundDuplicate: boolean;
    checked: boolean;
}