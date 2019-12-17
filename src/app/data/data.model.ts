import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';

export class Data {
    transactions: Transaction[] = [];
    accounts: UserAccount[] = [];
}