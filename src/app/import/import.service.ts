import { EventEmitter, Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { StagedTransaction } from '../import/stagedTransaction.model';

import * as _ from 'lodash';

import { TransactionParser } from './parsers/transactionParser';
import { TransactionsAccount } from '../models/transactions-account.model';
import { Subject } from 'rxjs';

import { SantanderBankPolskaParser } from './parsers/santanderPolskaParser';
import { MBankPolskaParser } from './parsers/mbankPolskaParser';
import { INGLuxembourgParser } from './parsers/ingLuxembourgParser';
import { RevolutParser } from './parsers/revolutParser';
import { UBSSwitzerlandParser } from './parsers/ubsSwitzerlandParser';
import { AccountsRepository } from '../repositories/accounts.repository';
import { TransactionsRepository } from '../repositories/transactions.repository';

@Injectable()
export class ImportService {

    stagedTransactionsChanged = new EventEmitter<StagedTransaction[]>();
    selectedAccountChanged = new EventEmitter<TransactionsAccount>();
    accountsChanges = new Subject<TransactionsAccount[]>();

    private _stagedTransactions: StagedTransaction[] = [];
    get stagedTransactions() {
        return this._stagedTransactions.slice();
    }
    set stagedTransactions(v: StagedTransaction[]) {
        this._stagedTransactions = v;
        this.stagedTransactionsChanged.emit(this.stagedTransactions);
    }

    private _selectedAccount: TransactionsAccount;
    get selectedAccount() {
        return this._selectedAccount;
    }
    set selectedAccount(v: TransactionsAccount) {
        this._selectedAccount = v;
        this.selectedAccountChanged.emit(this.selectedAccount);
    }

    private _accounts: TransactionsAccount[];
    get accounts() {
        return this._accounts;
    }
    set accounts(v: TransactionsAccount[]) {
        this._accounts = v;
        this.accountsChanges.next(this.accounts);
    }

    private parsers: TransactionParser[] = [
        new SantanderBankPolskaParser(),
        new MBankPolskaParser(),
        new INGLuxembourgParser(),
        new RevolutParser(),
        new UBSSwitzerlandParser(),
    ];

    constructor(private transactionsRepository: TransactionsRepository,
                private accountsRepository: AccountsRepository) {
        this.accountsRepository.changed.subscribe(() => this.accounts = this.accountsRepository.list());
        this.accounts = this.accountsRepository.list();
    }

    tryParse(input: File): void {
        const results: { name: string, transactions: Transaction[] }[] = [];
        const promises = this.parsers.map(p => {
            return p.parse(input)
                .then((data) => {
                    if (data.length > 0) {
                        results.push({ name: p.name, transactions: data });
                    }
                });
        });

        Promise.all(promises.map((p) => p.catch(e => e))).then(() => {
            // What if more then 1 result??
            this.stagedTransactions = results.find((r) => r.transactions.length > 0).transactions.map((t) => {
                const found = this.isDuplicate(t);
                return {
                    transaction: t,
                    foundDuplicate: found,
                    checked: !found
                } as StagedTransaction;
            });
        });
    }

    import(): void {
        this.transactionsRepository.addMany(
            this.stagedTransactions
                .filter(t => t.checked)
                .map((t) => {
                    const trans = t.transaction;
                    if (this.selectedAccount) {
                        trans.accountGuid = this.selectedAccount
                            ? this.selectedAccount.guid : trans.accountGuid;
                    }
                    return trans;
                })
        );
        this.stagedTransactions = [];
    }

    private isDuplicate(t: Transaction): boolean {
        return !!(this.transactionsRepository.list()
            .find((x) => Transaction.equals(t, x)));
    }
}
