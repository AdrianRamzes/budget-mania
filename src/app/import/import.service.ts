import { EventEmitter } from '@angular/core';
import { DataService } from '../data/data.service';
import { Transaction } from '../models/transaction.model';
import { StagedTransaction } from '../import/stagedTransaction.model';

import * as _ from 'lodash';

import { TransactionParser } from './parsers/transactionParser';
import { UserAccount } from '../models/user-account.model';
import { Subject } from 'rxjs';

import { SantanderBankPolskaParser } from './parsers/santanderPolskaParser';
import { MBankPolskaParser } from './parsers/mbankPolskaParser';
import { INGLuxembourgParser } from './parsers/ingLuxembourgParser';

export class ImportService {

    stagedTransactionsChanged = new EventEmitter<StagedTransaction[]>();
    selectedAccountChanged = new EventEmitter<UserAccount>();
    accountsChanges = new Subject<UserAccount[]>();

    private _stagedTransactions: StagedTransaction[] = [];
    get stagedTransactions() {
        return this._stagedTransactions.slice();
    }
    set stagedTransactions(v: StagedTransaction[]) {
        this._stagedTransactions = v;
        this.stagedTransactionsChanged.emit(this.stagedTransactions);
    }

    private _selectedAccount: UserAccount;
    get selectedAccount() {
        return this._selectedAccount;
    }
    set selectedAccount(v: UserAccount) {
        this._selectedAccount = v;
        this.selectedAccountChanged.emit(this.selectedAccount);
    }

    private _accounts: UserAccount[];
    get accounts() {
        return this._accounts;
    }
    set accounts(v: UserAccount[]){
        this._accounts = v;
        this.accountsChanges.next(this.accounts)
    }

    private parsers: TransactionParser[] = [
        new SantanderBankPolskaParser(),
        new MBankPolskaParser(),
        new INGLuxembourgParser(),
    ];

    constructor(private dataService: DataService) {
        dataService.accountsChanged.subscribe((e) => this.accounts = e );
        this.accounts = dataService.getAccounts();
    }

    tryParse(input: File): void {
        let results: { name: string, transactions: Transaction[] }[] = [];
        let promises = this.parsers.map(p => {
            return p.parse(input)
                .then((data) => {
                    if (data.length > 0) {
                        results.push({ name: p.name, transactions: data });
                    }
                });
        });

        Promise.all(promises.map((p) => p.catch(e => e))).then(() => {
            //What if more then 1 result??
            this.stagedTransactions = results.find((r) => r.transactions.length > 0).transactions.map((t) => {
                let found = this.isDuplicate(t);
                return {
                    transaction: t,
                    foundDuplicate: found,
                    checked: !found
                } as StagedTransaction;
            });
        });
    }

    import(): void {
        this.dataService.addTransactions(
            this.stagedTransactions
                .filter(t => t.checked)
                .map((t) => {
                    let trans = t.transaction;
                    if(this.selectedAccount) {
                        trans.accountGuid = this.selectedAccount 
                            ? this.selectedAccount.guid : trans.accountGuid;
                    }
                    return trans;
                })
        );
        this.stagedTransactions = [];
    }

    private isDuplicate(t: Transaction): boolean {
        return !!this.dataService.getTransactions()
            .find((x) => Transaction.equals(t, x));
    }
}