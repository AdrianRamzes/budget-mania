import { Data } from "../data.model";
import { Transaction } from '../../models/transaction.model';
import { Currency } from "../../models/currency.enum";
import { StorageHelper } from './storageHelper';
import { UserAccount } from '../../models/user-account.model';

export class FakeStorageHelper implements StorageHelper{

    save(data: string): Promise<void> {
        return Promise.resolve();
    }

    load(): Promise<string> {
        return Promise.resolve(JSON.stringify({
            transactions: [{
                IBAN: "test1",
                amount: -50,
                category: null,
                currency: Currency.PLN,
                date: new Date(),
                title: "test title"
            } as Transaction, {
                IBAN: "test2",
                amount: -666,
                category: null,
                currency: Currency.PLN,
                date: new Date(),
                title: "test title123"
            } as Transaction],
            accounts: [{
                IBAN: "test1",
                bankName: "test1",
                currency: Currency.PLN,
                fullName: "TEST1 TEST1",
                name: "TEST1"
            } as UserAccount,
            {
                IBAN: "test2",
                bankName: "test2",
                currency: Currency.USD,
                fullName: "TEST2 TEST2",
                name: "TEST2"
            } as UserAccount]
        } as Data));
    }
}