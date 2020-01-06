import * as _ from "lodash";

import { Data } from "./data.model";
import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';
import { StorageService } from './storage/storage.service';
import { EventEmitter } from '@angular/core';
import { Guid } from "guid-typescript";
import { Category } from '../models/category.model';

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
    editTransaction(t: Transaction) {
        let transactions = this.getTransactions();
        let i = _.findIndex(transactions, {guid: t.guid});
        transactions[i] = t;
        this.setTransactions(transactions);
    }
    removeTransaction(t: Transaction) {
        let transactions = this.getTransactions();
        _.remove(transactions, (x) => x.guid === t.guid);
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

    private _categories: Category[] = [
        { name: "Entertainment", color: "#FF0000" } as Category,
            { name: "Arts", color: "#FF9900", parentName: "Entertainment" } as Category,
            { name: "Music", color: "#FF9900", parentName: "Entertainment" } as Category,
            { name: "Movies & DVDs", color: "#FF9900", parentName: "Entertainment" } as Category,
            { name: "Books (Entertainment)", color: "#FF9900", parentName: "Entertainment" } as Category,
            { name: "Newspaper & Magazines", color: "#FF9900", parentName: "Entertainment" } as Category,
        { name: "Education", color: "#FF0000" } as Category,
            { name: "Tuition", color: "#FF9900", parentName: "Education" } as Category,
            { name: "Student Loan", color: "#FF9900", parentName: "Education" } as Category,
            { name: "Books & Supplies", color: "#FF9900", parentName: "Education" } as Category,
        { name: "Shopping", color: "#FF0000" } as Category,
            { name: "Clothing", color: "#FF9900", parentName: "Shopping" } as Category,
            { name: "Electronics & Software", color: "#FF9900", parentName: "Shopping" } as Category,
            { name: "Hobbies", color: "#FF9900", parentName: "Shopping" } as Category,
            { name: "Sporting Goods", color: "#FF9900", parentName: "Shopping" } as Category,
        { name: "Transport", color: "#FF0000" } as Category,
            { name: "Car", color: "#FF9900", parentName: "Transport" } as Category,
        { name: "Home", color: "#00FF00" } as Category,
        { name: "Food", color: "#0000FF" } as Category,
    ];
    getCategories(): Category[] {
        return this._categories;
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
                    let newTransaction = new Transaction();
                    newTransaction.guid = t.guid || Guid.create().toString();
                    newTransaction.title = t.title;
                    newTransaction.IBAN = t.IBAN;
                    newTransaction.amount = t.amount;
                    newTransaction.currency = t.currency;
                    newTransaction.date = new Date(t.date);
                    newTransaction.categoryName = t.categoryName || null;
                    newTransaction.accountGuid = t.accountGuid || null;
                    return newTransaction;
                }),
                accounts: deserialized.accounts.map(a => {
                    let newAcc = new UserAccount();
                    newAcc.guid = a.guid || Guid.create().toString();
                    newAcc.IBAN = a.IBAN;
                    newAcc.bankName = a.bankName;
                    newAcc.currency = a.currency;
                    newAcc.fullName = a.fullName;
                    newAcc.name = a.name;
                    return newAcc;;
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
