import * as _ from "lodash";

import { DataService } from '../data/data.service';
import { Transaction } from '../models/transaction.model';
import { Guid } from "guid-typescript";
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TransactionsRepository {

    changed: EventEmitter<Transaction[]> = new EventEmitter();

    private readonly _KEY: string = "transactions";

    private _transactions: Transaction[] = null;

    constructor(private betterDataService: DataService) {
        betterDataService.dataChanged.subscribe((key) => {
            if (key == this._KEY) {
                this.load();
                this.changed.emit(this.list());
            }
        });
    }

    list(): Transaction[] {
        if(this._transactions == null) {
            this.load();
        }

        return this._transactions.slice();
    }

    add(transaction: Transaction) {
        let transactions = this.list();
        transactions.push(transaction);
        this.set(transactions);
    }

    addMany(arr: Transaction[]) {
        let transactions = this.list();
        transactions.push(...arr);
        this.set(transactions);
    }

    edit(t: Transaction) {
        let transactions = this.list();
        let i = _.findIndex(transactions, {guid: t.guid});
        transactions[i] = t;
        this.set(transactions);
    }

    editMany(arr: Transaction[]) {
        //TODO: implementation
    }

    remove(t: Transaction) {
        let transactions = this.list();
        _.remove(transactions, (x) => x.guid === t.guid);
        this.set(transactions);
    }
    
    removeMany(arr: Transaction[]) {
        let transactions = this.list();
        _.remove(transactions, (x) => !!_.find(arr, (t) => t.guid === x.guid));
        this.set(transactions);
    }

    private load(): void {
        if(this.betterDataService.containsKey(this._KEY)) {
            let jsonStr = this.betterDataService.get(this._KEY);
            this._transactions = this.deserialize(jsonStr);
        } else {
            this._transactions = [];
        }
    }

    private set(value: Transaction[]) {
        this._transactions = (value || []).slice();
        //let serialized = JSON.stringify(this._transactions);
        this.betterDataService.set(this._KEY, this._transactions);
    }

    private deserialize(deserialized: any[]): Transaction[] {
        //let deserialized = JSON.parse(jsonStr);
        return (deserialized || [])
        .map((t) => {
            let newTransaction = new Transaction();
            newTransaction.guid = t.guid || Guid.create().toString();
            newTransaction.title = t.title;
            newTransaction.beneficiaryName = t.beneficiaryName || null;
            newTransaction.transactionIdentifier = t.transactionIdentifier || null;
            newTransaction.IBAN = t.IBAN;
            newTransaction.sourceIBAN = t.sourceIBAN || null;
            newTransaction.destinationIBAN = t.destinationIBAN || null;
            newTransaction.amount = t.amount;
            newTransaction.currency = t.currency;
            newTransaction.date = new Date(t.date);
            newTransaction.accountingDate = t.accountingDate ? new Date(t.accountingDate) : null;
            newTransaction.valueDate = t.valueDate ? new Date(t.valueDate) : null;
            newTransaction.importDate = t.importDate || null;
            newTransaction.importGuid = t.importGuid || null;
            newTransaction.categoryGuid = t.categoryGuid || null;
            newTransaction.accountGuid = t.accountGuid || null;
            return newTransaction;
        });
    }
}