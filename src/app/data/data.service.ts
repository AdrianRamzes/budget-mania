import * as _ from "lodash";

import { Data } from "./data.model";
import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';
import { StorageService } from './storage/storage.service';
import { EventEmitter } from '@angular/core';

export class DataService {

    accountsChanged = new EventEmitter<UserAccount[]>();
    transactionsChanged = new EventEmitter<Transaction[]>();

    constructor(private storageService: StorageService) {
        storageService.load().then(
            (data) => this.setDataFromString(data),
            (error) => console.log(error)
        );
    }

    private _data: Data = new Data();

    getTransactions(): Transaction[] {
        return this._data.transactions.slice();
    }
    setTransactions(value: Transaction[]) {
        this._data = {
            ...this._data,
            transactions: value.slice(),
        };
        this.updateStorage();
        this.transactionsChanged.next(this.getTransactions());
    }
    addTransactions(arr: Transaction[]) {
        let transactions = this.getTransactions();
        transactions.push(...arr);
        this.setTransactions(transactions);
    }

    getAccounts(): UserAccount[] {
        return this._data.accounts.slice();
    }
    setAccounts(value: UserAccount[]) {
        this._data = {
            ...this._data,
            accounts: value.slice(),
        };
        this.updateStorage();
        this.accountsChanged.emit(this.getAccounts());
    }
    addAccount(a: UserAccount) {
        let accounts = this.getAccounts();
        accounts.push(a);
        this.setAccounts(accounts);
    }
    editAccount(a: UserAccount) {
        let accounts = this.getAccounts();
        let i = _.findIndex(accounts, { IBAN: a.IBAN });
        accounts[i] = a;
        this.setAccounts(accounts);
    }
    removeAccount(a: UserAccount) {
        let accounts = this.getAccounts();
        _.remove(accounts, (x) => x.IBAN === a.IBAN);
        this.setAccounts(accounts);
    }

    serialize(): string {
        return JSON.stringify(this._data);
    }

    setDataFromString(jsonString: string): void {
        this._data = this.deserialize(jsonString);
        this.accountsChanged.next(this._data.accounts);
        this.transactionsChanged.next(this._data.transactions);
    }

    private deserialize(serialized: string): Data {
        let deserialized = JSON.parse(serialized);
        if (deserialized) {
            return {
                transactions: deserialized.transactions.map((t) => {
                    return {
                        ...t,
                        date: new Date(t.date)
                    } as Transaction;
                }),
                accounts: deserialized.accounts.map(a => {
                    return {
                        ...a
                    } as Account;
                })
            };
        }

        return {
            transactions: [],
            accounts: []
        };
    }

    private updateStorage(): void {
        this.storageService.save(this.serialize()).then(
            (success) => {
                console.log(success);
            },
            (error) => {
                console.log(error);
            }
        );
    }
}
