import * as _ from 'lodash';

import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Guid } from 'guid-typescript';
import { TransactionsAccount } from '../models/transactions-account.model';
import { TransactionsRepository } from './transactions.repository';

@Injectable({providedIn: 'root'})
export class AccountsRepository {

    changed: EventEmitter<TransactionsAccount[]> = new EventEmitter();

    private readonly _KEY: string = 'accounts';

    private ACCOUNTS: TransactionsAccount[] = null;

    constructor(private dataService: DataService,
                private transactionsRepository: TransactionsRepository) {

        this.dataService.dataChanged.subscribe(key => {
            if (key === this._KEY) {
                this.load();
                this.changed.emit(this.list());
            }
        });
    }

    list(): TransactionsAccount[] {
        if (this.ACCOUNTS == null) {
            this.load();
        }
        return this.ACCOUNTS.slice();
    }

    get(guid: string): TransactionsAccount {
        return _.find(this.ACCOUNTS, a => a.guid === guid) || null;
    }

    add(a: TransactionsAccount): void {
        const accounts = this.list();
        accounts.push(a);
        this.set(accounts);
    }

    edit(a: TransactionsAccount): void {
        const accounts = this.list();
        const i = _.findIndex(accounts, { guid: a.guid });
        accounts[i] = a;
        this.set(accounts);
    }

    remove(a: TransactionsAccount) {
        const accounts = this.list();
        _.remove(accounts, (x) => x.guid === a.guid);
        this.set(accounts);

        const transactions = this.transactionsRepository.list()
            .filter(x => x.accountGuid === a.guid);

        _.forEach(transactions, t => t.accountGuid = null);

        this.transactionsRepository.editMany(transactions);
    }

    private load(): void {
        if (this.dataService.containsKey(this._KEY)) {
            const jsonStr = this.dataService.get(this._KEY);
            this.ACCOUNTS = this.deserialize(jsonStr);
        } else {
            this.ACCOUNTS = [];
        }
    }

    private set(value: TransactionsAccount[]) {
        this.ACCOUNTS = (value || []).slice();
        this.dataService.set(this._KEY, this.ACCOUNTS);
    }

    private deserialize(deserialized: any[]): TransactionsAccount[] {
        return (deserialized || []).map(a => {
            const newAcc = new TransactionsAccount();
            newAcc.guid = a.guid || Guid.create().toString();
            newAcc.IBAN = a.IBAN;
            newAcc.bankName = a.bankName;
            newAcc.currency = a.currency;
            newAcc.fullName = a.fullName;
            newAcc.name = a.name;
            return newAcc;
        });
    }
}
