import * as _ from 'lodash';

import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Guid } from 'guid-typescript';
import { Transaction } from '../models/transaction.model';
import { Currency } from '../models/currency.enum';

@Injectable({providedIn: 'root'})
export class TransactionsRepository {

    private static readonly _KEY: string = 'transactions';

    changed: EventEmitter<Transaction[]> = new EventEmitter();

    private _TRANSACTIONS: Transaction[] = null;

    constructor(private dataService: DataService) {
        dataService.dataChanged.subscribe((key) => {
            if (key === TransactionsRepository._KEY) {
                this.load();
                this.changed.emit(this.list());
            }
        });
        this.load();
    }

    list(): Transaction[] {
        const t = new Transaction();
        t.date = new Date();
        t.information = 'test';
        t.amount = -1;
        t.currency = Currency.CHF;
        return [t];
        if (this._TRANSACTIONS == null) {
            this.load();
        }

        return this._TRANSACTIONS.slice();
    }

    add(transaction: Transaction): void {
        this.addMany([transaction]);
    }

    addMany(arr: Transaction[]): void {
        const transactions = this.list();
        transactions.push(...arr);
        this.set(transactions);
    }

    edit(t: Transaction) {
        this.editMany([t]);
    }

    editMany(arr: Transaction[]): void {
        const transactions = this.list();
        arr.forEach(t => {
            const i = _.findIndex(transactions, {guid: t.guid});
            transactions[i] = t;
        });
        this.set(transactions);
    }

    remove(t: Transaction): void {
        this.removeMany([t]);
    }

    removeMany(arr: Transaction[]): void {
        const transactions = this.list();
        _.remove(transactions, (x) => !!_.find(arr, (t) => t.guid === x.guid));
        this.set(transactions);
    }

    private load(): void {
        if (this.dataService.containsKey(TransactionsRepository._KEY)) {
            const data = this.dataService.get(TransactionsRepository._KEY);
            this._TRANSACTIONS = this.getTransactions(data);
        } else {
            this._TRANSACTIONS = [];
        }
    }

    private set(value: Transaction[]) {
        this._TRANSACTIONS = (value || []).slice();
        this.dataService.set(TransactionsRepository._KEY, this._TRANSACTIONS);
    }

    private getTransactions(deserialized: any[]): Transaction[] {
        return (deserialized || [])
        .map((t) => {
            const newTransaction = new Transaction();
            newTransaction.guid = t.guid || Guid.create().toString();
            newTransaction.information = t.information;
            newTransaction.beneficiaryName = t.beneficiaryName || null;
            newTransaction.identifier = t.transactionIdentifier || null;
            newTransaction.IBAN = t.IBAN;
            newTransaction.sourceIBAN = t.sourceIBAN || null;
            newTransaction.destinationIBAN = t.destinationIBAN || null;
            newTransaction.amount = t.amount;
            newTransaction.currency = t.currency;
            newTransaction.date = new Date(t.date);
            // newTransaction.accountingDate = t.accountingDate ? new Date(t.accountingDate) : null;
            newTransaction.valueDate = t.valueDate ? new Date(t.valueDate) : null;
            newTransaction.importDate = t.importDate || null;
            newTransaction.importGuid = t.importGuid || null;
            newTransaction.categoryGuid = t.categoryGuid || null;
            newTransaction.accountGuid = t.accountGuid || null;
            return newTransaction;
        });
    }
}
