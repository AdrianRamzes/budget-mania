import * as _ from 'lodash';

import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({providedIn: 'root'})
export class TransactionsRepository {

    private static readonly _KEY: string = 'transactions';

    changed: EventEmitter<void> = new EventEmitter();

    private _TRANSACTIONS: Transaction[] = null;

    constructor(private dataService: DataService) {
        dataService.dataChanged.subscribe((key) => {
            if (key === TransactionsRepository._KEY) {
                this.load();
                this.changed.emit();
            }
        });
        this.load();
    }

    get(guid: string): Transaction {
        if (!this.contains(guid)) {
            return null;
        }

        return this._TRANSACTIONS.find(e => e.guid === guid);
    }

    /** Returns list of all transactions. */
    list(): Transaction[] {
        return this.fixTypes(this.deepClone(this._TRANSACTIONS));
    }

    contains(guid: string): boolean {
        return this._TRANSACTIONS.findIndex(e => e.guid === guid) >= 0;
    }

    add(transaction: Transaction): void {
        this.addMany([transaction]);
    }

    addMany(arr: Transaction[]): void {
        this._TRANSACTIONS.push(...arr);
        this.update();
    }

    /** Finds existing transaction by guid and then replace it with passed one.
     *
     * Throws error if transaction does not exist.
     */
    edit(t: Transaction) {
        this.editMany([t]);
    }

    editMany(arr: Transaction[]): void {
        arr.forEach(t => {
            const i = _.findIndex(this._TRANSACTIONS, { guid: t.guid });
            this._TRANSACTIONS[i] = t;
        });
        this.update();
    }

    remove(guid: string): void {
        this.removeMany([guid]);
    }

    removeMany(guids: string[]): void {
        _.remove(this._TRANSACTIONS, (x) => _.find(guids, t => t === x.guid));
        this.update();
    }

    private load(): void {
        if (this.dataService.containsKey(TransactionsRepository._KEY)) {
            const data = this.dataService.get(TransactionsRepository._KEY);
            this._TRANSACTIONS = this.fixTypes(data);
        } else {
            this._TRANSACTIONS = [];
        }
    }

    private update() {
        this.dataService.set(TransactionsRepository._KEY, this._TRANSACTIONS);
    }

    private deepClone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    private fixTypes(deserialized: any[]): Transaction[] {
        return (deserialized ?? []).map((t) => {
            const newTransaction = new Transaction(t.guid);
            newTransaction.IBAN = t.IBAN || null;
            newTransaction.accountGuid = t.accountGuid || null;
            newTransaction.addressLine = t.addressLine || null;
            newTransaction.amount = t.amount;
            newTransaction.beneficiaryDetails = t.beneficiaryDetails || null;
            newTransaction.beneficiaryName = t.beneficiaryName || null;
            newTransaction.categoryGuid = t.categoryGuid || null;
            newTransaction.currency = t.currency || null;
            newTransaction.date = t.date ? new Date(t.date) : null;
            newTransaction.destinationIBAN = t.destinationIBAN || null;
            newTransaction.information = t.information || null;
            newTransaction.identifier = t.identifier || null;
            newTransaction.importDate = t.importDate ? new Date(t.importDate) : null;
            newTransaction.importGuid = t.importGuid || null;
            newTransaction.reference = t.reference || null;
            newTransaction.sourceIBAN = t.sourceIBAN || null;
            newTransaction.valueDate = t.valueDate ? new Date(t.valueDate) : null;
            return newTransaction;
        });
    }
}
