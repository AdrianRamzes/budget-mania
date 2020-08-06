import * as _ from "lodash";

import { EventEmitter, Injectable } from '@angular/core';
import { BetterDataService } from '../betterdata.service';
import { UserAccount } from '../../models/user-account.model';
import { Guid } from "guid-typescript";
import { TransactionsRepository } from './transactions.repository';

@Injectable({providedIn: 'root'})
export class AccountsRepository {

    changed: EventEmitter<UserAccount[]> = new EventEmitter();

    private readonly _KEY: string = "accounts";

    private _accounts: UserAccount[] = null;

    constructor(private betterDataService: BetterDataService,
                private transactionsRepository: TransactionsRepository) {

        this.betterDataService.dataChanged.subscribe(key => {
            if(key == this._KEY) {
                this.load();
                this.changed.emit(this.list());
            }
        })
    }

    list(): UserAccount[] {
        if(this._accounts == null) {
            this.load();
        }
        return this._accounts.slice();
    }

    get(guid: string): UserAccount {
        return _.find(this._accounts, a => a.guid === guid) || null;
    }

    add(a: UserAccount): void {
        let accounts = this.list();
        accounts.push(a);
        this.set(accounts);
    }

    edit(a: UserAccount): void {
        let accounts = this.list();
        let i = _.findIndex(accounts, { guid: a.guid });
        accounts[i] = a;
        this.set(accounts);
    }

    remove(a: UserAccount) {
        let accounts = this.list();
        _.remove(accounts, (x) => x.guid === a.guid);
        this.set(accounts);

        let transactions = this.transactionsRepository.list()
            .filter(x => x.accountGuid == a.guid);
        
        _.forEach(transactions, t => t.accountGuid = null);

        this.transactionsRepository.editMany(transactions);
    }

    private load(): void {
        if(this.betterDataService.containsKey(this._KEY)) {
            let jsonStr = this.betterDataService.get(this._KEY);
            this._accounts = this.deserialize(jsonStr);
        } else {
            this._accounts = [];
        }
    }

    private set(value: UserAccount[]) {
        this._accounts = (value || []).slice();
        //let serialized = JSON.stringify(this._accounts);
        this.betterDataService.set(this._KEY, this._accounts);
    }

    private deserialize(deserialized: any[]): UserAccount[] {
        //let deserialized = JSON.parse(jsonStr);
        return (deserialized || []).map(a => {
            let newAcc = new UserAccount();
            newAcc.guid = a.guid || Guid.create().toString();
            newAcc.IBAN = a.IBAN;
            newAcc.bankName = a.bankName;
            newAcc.currency = a.currency;
            newAcc.fullName = a.fullName;
            newAcc.name = a.name;
            return newAcc;
        })
    }
}