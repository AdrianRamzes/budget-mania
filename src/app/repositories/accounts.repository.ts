import * as _ from 'lodash';

import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';
import { TransactionsAccount } from '../models/transactions-account.model';
import { TransactionsRepository } from './transactions.repository';

@Injectable({providedIn: 'root'})
export class AccountsRepository {

    private static readonly _KEY: string = 'accounts';

    changed: EventEmitter<void> = new EventEmitter();

    private _ACCOUNTS: TransactionsAccount[] = null;

    constructor(private dataService: DataService,
                private transactionsRepository: TransactionsRepository) {

        this.dataService.dataChanged.subscribe(key => {
            if (key === AccountsRepository._KEY) {
                this.load();
                this.changed.emit();
            }
        });
        this.load();
    }

    list(): TransactionsAccount[] {
        return this.fixTypes(this.deepClone(this._ACCOUNTS));
    }

    contains(guid: string): boolean {
        return this._ACCOUNTS.findIndex(e => e.guid === guid) >= 0;
    }

    get(guid: string): TransactionsAccount {
        if (!this.contains(guid)) {
            return null;
        }

        return this._ACCOUNTS.find(e => e.guid === guid);
    }

    add(a: TransactionsAccount): void {
        this._ACCOUNTS.push(a);
        this.update();
    }

    edit(a: TransactionsAccount): void {
        const i = _.findIndex(this._ACCOUNTS, { guid: a.guid });
        this._ACCOUNTS[i] = a;
        this.update();
    }

    remove(guid: string): void {
        _.remove(this._ACCOUNTS, (x) => x.guid === guid);
        this.update();

        const transactions = this.transactionsRepository.list()
            .filter(x => x.accountGuid === guid);

        _.forEach(transactions, t => t.accountGuid = null);

        this.transactionsRepository.editMany(transactions);
    }

    private load(): void {
        if (this.dataService.containsKey(AccountsRepository._KEY)) {
            const data = this.dataService.get(AccountsRepository._KEY);
            this._ACCOUNTS = this.fixTypes(data);
        } else {
            this._ACCOUNTS = [];
        }
    }

    private update() {
        this.dataService.set(AccountsRepository._KEY, this._ACCOUNTS);
    }

    private deepClone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    private fixTypes(deserialized: any[]): TransactionsAccount[] {
        return deserialized.map((a) => {
            const newAcc = new TransactionsAccount(a.guid);
            newAcc.IBAN = a.IBAN || null;
            newAcc.bankName = a.bankName || null;
            newAcc.currency = a.currency || null;
            newAcc.fullName = a.fullName || null;
            newAcc.name = a.name || null;
            return newAcc;
        });
    }
}
