import * as _ from "lodash";

import { Data } from "./data.model";
import { Transaction } from '../models/transaction.model';
import { UserAccount } from '../models/user-account.model';
import { StorageService } from './storage/storage.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Guid } from "guid-typescript";
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';
import { Currency } from '../models/currency.enum';

@Injectable()
export class DataService {

    //accountsChanged = new EventEmitter<UserAccount[]>();
    transactionsChanged = new EventEmitter<Transaction[]>();
    // categoriesChanged = new EventEmitter<Category[]>();
    // selectedCurrencyChanged = new EventEmitter<Currency>();
    // exchangeChanged =  new EventEmitter<any>();

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

    // getAccounts(): UserAccount[] {
    //     return this._data.accounts.slice();
    // }
    // getAccount(guid: string): UserAccount {
    //     return _.find(this.getAccounts(), a => a.guid === guid) || null;
    // }
    // private setAccounts(value: UserAccount[]) {
    //     this._data = {
    //         ...this._data,
    //         accounts: value.slice(),
    //     };
    //     this.updateStorage();
    //     this.accountsChanged.emit(this.getAccounts());
    // }
    // addAccount(a: UserAccount) {
    //     let accounts = this.getAccounts();
    //     accounts.push(a);
    //     this.setAccounts(accounts);
    // }
    // editAccount(a: UserAccount) {
    //     let accounts = this.getAccounts();
    //     let i = _.findIndex(accounts, { guid: a.guid });
    //     accounts[i] = a;
    //     this.setAccounts(accounts);
    // }
    // removeAccount(a: UserAccount) {
    //     let accounts = this.getAccounts();
    //     _.remove(accounts, (x) => x.guid === a.guid);
    //     this.setAccounts(accounts);
    //     let transactions = this.getTransactions().map((x) => {
    //         if(x.accountGuid == a.guid)
    //             x.accountGuid = null;
    //         return x;
    //     });
    //     this.setTransactions(transactions);
    // }

    // getCategories(): Category[] {
    //     return this._data.categories.slice();
    // }
    // getCategory(guid: string): Category {
    //     return _.find(this.getCategories(), c => c.guid === guid) || null;
    // }
    // private setCategories(value: Category[]) {
    //     this._data = {
    //         ...this._data,
    //         categories: value.slice(),
    //     };
    //     this.updateStorage();
    //     this.categoriesChanged.emit(this.getCategories());
    // }
    // addCategory(c: Category) {
    //     let categories = this.getCategories();
    //     categories.push(c);
    //     this.setCategories(categories);
    // }
    // editCategory(c: Category) {
    //     let categories = this.getCategories();
    //     let i = _.findIndex(categories, { guid: c.guid });
    //     categories[i] = c;
    //     this.setCategories(categories);
    // }
    // removeCategory(a: Category) {
    //     let categories = this.getCategories();
    //     _.remove(categories, (x) => x.guid === a.guid);
    //     this.setCategories(categories);
    //     let transactions = this.getTransactions().map((x) => {
    //         if(x.categoryGuid == a.guid)
    //             x.categoryGuid = null;
    //         return x;
    //     });
    //     this.setTransactions(transactions);
    // }

    // getSelectedCurrency(): Currency {
    //     return this._data.settings && this._data.settings.selectedCurrency || Currency.EUR;
    // }
    // setSelectedCurrency(c: Currency) {
    //     if(!this._data.settings) {
    //         this._data.settings = {};
    //     }
    //     this._data.settings.selectedCurrency = c;
    //     this.updateStorage();
    //     this.selectedCurrencyChanged.emit(this._data.settings.selectedCurrency);
    // }

    // getExchangeRate(from: Currency, to: Currency): number {
    //     if(this._data.exchange) {
    //         if(this._data.exchange) {
    //             let fromEUR = from !== Currency.EUR ? this._data.exchange["rates"][Currency[from]] : 1;
    //             let toEUR = to !== Currency.EUR ? this._data.exchange["rates"][Currency[to]] : 1;
    //             return toEUR/fromEUR;
    //         }
    //     }
    //     return -1;
    // }
    // getExchangeRates() {
    //     return this._data.exchange;
    // }
    // setExchangeRates(x: any) {
    //     this._data.exchange = x;
    //     this.updateStorage();
    //     this.exchangeChanged.emit(this._data.exchange);
    // }

    getSerializedData(): string {
        return JSON.stringify(this._data);
    }

    setDataFromString(jsonString: string): void {
        this._data = this.deserialize(jsonString);

        //this.accountsChanged.emit(this.getAccounts());
        this.transactionsChanged.emit(this.getTransactions());
        //this.categoriesChanged.emit(this.getCategories());
        //this.selectedCurrencyChanged.emit(this.getSelectedCurrency());
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
                }),
                settings: deserialized.settings || {},
                exchange: deserialized.exchange || {}
            };
        }

        return {
            transactions: [],
            accounts: [],
            categories: [],
            settings: {},
            exchange: {}
        };
    }

    dump(): void {
        if(!environment.production)
            console.log(this._data);
    }

    private updateStorage(): void {
        this.storageService.save(this.getSerializedData()).then(
            (success) => {
                console.log(success);
            },
            (error) => {
                console.log(error);
            }
        );
    }
}
