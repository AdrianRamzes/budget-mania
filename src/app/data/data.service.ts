import * as _ from "lodash";

import { Data } from "./data.model";
import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';
import { StorageService } from './storage/storage.service';
import { EventEmitter } from '@angular/core';
import { Guid } from "guid-typescript";
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';

export class DataService {

    accountsChanged = new EventEmitter<UserAccount[]>();
    transactionsChanged = new EventEmitter<Transaction[]>();
    categoriesChanged = new EventEmitter<Category[]>();

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
    private setTransactions(value: Transaction[]) {
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
    removeTransactions(trans: Transaction[]) {
        let transactions = this.getTransactions();
        _.remove(transactions, (x) => !!_.find(trans, (t) => t.guid === x.guid));
        this.setTransactions(transactions);
    }

    getAccounts(): UserAccount[] {
        return this._data.accounts.slice();
    }
    getAccount(guid: string): UserAccount {
        return _.find(this.getAccounts(), a => a.guid === guid) || null;
    }
    private setAccounts(value: UserAccount[]) {
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
        let i = _.findIndex(accounts, { guid: a.guid });
        accounts[i] = a;
        this.setAccounts(accounts);
    }
    removeAccount(a: UserAccount) {
        let accounts = this.getAccounts();
        _.remove(accounts, (x) => x.guid === a.guid);
        this.setAccounts(accounts);
        let transactions = this.getTransactions().map((x) => {
            if(x.accountGuid == a.guid)
                x.accountGuid = null;
            return x;
        });
        this.setTransactions(transactions);
    }

    getCategories(): Category[] {
        return this._data.categories.slice();
    }
    getCategory(guid: string): Category {
        return _.find(this.getCategories(), c => c.guid === guid) || null;
    }
    private setCategories(value: Category[]) {
        this._data = {
            ...this._data,
            categories: value.slice(),
        };
        this.updateStorage();
        this.categoriesChanged.emit(this.getCategories());
    }
    addCategory(c: Category) {
        let categories = this.getCategories();
        categories.push(c);
        this.setCategories(categories);
    }
    editCategory(c: Category) {
        let categories = this.getCategories();
        let i = _.findIndex(categories, { guid: c.guid });
        categories[i] = c;
        this.setCategories(categories);
    }
    removeCategory(a: Category) {
        let categories = this.getCategories();
        _.remove(categories, (x) => x.guid === a.guid);
        this.setCategories(categories);
        let transactions = this.getTransactions().map((x) => {
            if(x.categoryGuid == a.guid)
                x.categoryGuid = null;
            return x;
        });
        this.setTransactions(transactions);
    }

    serialize(): string {
        return JSON.stringify(this._data);
    }

    setDataFromString(jsonString: string, emitChanges = false): void {
        this._data = this.deserialize(jsonString);
        if(emitChanges) {
            this.accountsChanged.emit(this._data.accounts);
            this.transactionsChanged.emit(this._data.transactions);
            this.categoriesChanged.emit(this._data.categories);
        }
    }

    private deserialize(serialized: string): Data {
        let deserialized = JSON.parse(serialized);
        if (deserialized) {
            return {
                transactions: (deserialized.transactions || []) .map((t) => {
                    let newTransaction = new Transaction();
                    newTransaction.guid = t.guid || Guid.create().toString();
                    newTransaction.title = t.title;
                    newTransaction.IBAN = t.IBAN;
                    newTransaction.sourceIBAN = t.sourceIBAN || null;
                    newTransaction.destinationIBAN = t.destinationIBAN || null;
                    newTransaction.amount = t.amount;
                    newTransaction.currency = t.currency;
                    newTransaction.date = new Date(t.date);
                    newTransaction.importDate = t.importDate || null;
                    newTransaction.importGuid = t.importGuid || null;
                    newTransaction.rawData = t.rawData || null;
                    newTransaction.categoryGuid = t.categoryGuid || null;
                    newTransaction.accountGuid = t.accountGuid || null;
                    return newTransaction;
                }),
                accounts: (deserialized.accounts || []).map(a => {
                    let newAcc = new UserAccount();
                    newAcc.guid = a.guid || Guid.create().toString();
                    newAcc.IBAN = a.IBAN;
                    newAcc.bankName = a.bankName;
                    newAcc.currency = a.currency;
                    newAcc.fullName = a.fullName;
                    newAcc.name = a.name;
                    return newAcc;
                }),
                categories: (deserialized.categories || []).map(c => {
                    let cat = new Category();
                    cat.guid = c.guid || Guid.create().toString();
                    cat.color = c.color;
                    cat.name = c.name;
                    cat.parentName = c.parentName;
                    return cat;
                })
            };
        }

        return {
            transactions: [],
            accounts: [],
            categories: []
        };
    }

    dump(): void {
        if(!environment.production)
            console.log(this._data);
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
