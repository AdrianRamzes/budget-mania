import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';
import { Category } from '../models/category.model';

export class Data {
    transactions: Transaction[] = [];
    accounts: UserAccount[] = [];
    categories: Category[] = [];
    settings: any = {};
    exchange: any = {};
}