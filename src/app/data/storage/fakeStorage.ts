import { Transaction } from '../../models/transaction.model';
import { Currency } from "../../models/currency.enum";
import { StorageHelper } from './storageHelper';
import { UserAccount } from '../../models/user-account.model';
import { Category } from 'src/app/models/category.model';

export class FakeStorageHelper implements StorageHelper{

    save(data: string): Promise<void> {
        return Promise.resolve();
    }

    load(): Promise<string> {
        return Promise.resolve(JSON.stringify({
            transactions: [{
                    IBAN: "test1",
                    amount: -50,
                    accountGuid: "account-guid-1",
                    categoryGuid: "category-guid-1",
                    currency: Currency.PLN,
                    date: new Date(),
                    title: "test title"
                } as Transaction, {
                    IBAN: "test2",
                    amount: -666,
                    categoryGuid: "category-guid-1",
                    currency: Currency.PLN,
                    date: new Date(),
                    title: "test title123"
                } as Transaction, {
                    IBAN: "test2",
                    amount: -666,
                    currency: Currency.PLN,
                    date: new Date(),
                    title: "test title123"
                } as Transaction
            ],
            accounts: [{
                    guid: "account-guid-1",
                    IBAN: "test1",
                    bankName: "test1",
                    currency: Currency.PLN,
                    fullName: "TEST1 TEST1",
                    name: "TEST1"
                } as UserAccount, {
                    guid: "account-guid-2",
                    IBAN: "test2",
                    bankName: "test2",
                    currency: Currency.USD,
                    fullName: "TEST2 TEST2",
                    name: "TEST2"
                } as UserAccount
            ],
            categories: [{
                    guid: "category-guid-1",
                    color: "",
                    name: "Transport",
                    parentName: null
                } as Category,
                {
                    guid: "category-guid-2",
                    color: "",
                    name: "Food",
                    parentName: null
                }
            ]
        }));
    }
}