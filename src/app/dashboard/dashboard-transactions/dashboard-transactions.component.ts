import * as $ from 'jquery';
import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';
import { Category } from 'src/app/models/category.model';
import { UserAccount } from 'src/app/models/user-account.model';
import { Currency } from 'src/app/models/currency.enum';
import { SettingsRepository } from 'src/app/repositories/settings.repository';
import { ExchangeRepository } from 'src/app/repositories/exchange.repository';
import { CategoriesRepository } from 'src/app/repositories/categories.repository';
import { AccountsRepository } from 'src/app/repositories/accounts.repository';
import { TransactionsRepository } from 'src/app/repositories/transactions.repository';

@Component({
    selector: 'app-dashboard-transactions',
    templateUrl: './dashboard-transactions.component.html'
})
export class DashboardTransactionsComponent implements OnInit {

    allTransactions: TransactionDisplayItem[] = [];
    filteredTransactions: TransactionDisplayItem[] = [];

    filterText: string = "";
    displayCount: number = 15;
    totalSum: number = 0;
    filteredAvg: number = 0;
    filteredMin: number = 0;
    filteredMax: number = 0;

    constructor(private transactionsRepository: TransactionsRepository,
                private accountsRepository: AccountsRepository,
                private categoriesRepository: CategoriesRepository,
                private settingsRepository: SettingsRepository,
                private exchangeRepository: ExchangeRepository) {
    }

    ngOnInit() {
        this.transactionsRepository.changed.subscribe(e => this.updateDisplayedTransactions(e));
        this.settingsRepository.changed.subscribe(e => {
            this.updateDisplayedTransactions(this.transactionsRepository.list());
        });

        this.updateDisplayedTransactions(this.transactionsRepository.list());
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onFilterChange(text) {
        this.updateFilteredTransactions();
    }

    onScroll(e: any) {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            this.loadMoreTransactions();
        }
    }

    private loadMoreTransactions(): void {
        this.displayCount = Math.min(this.displayCount+10, this.filteredTransactions.length);
    }

    private updateDisplayedTransactions(transactions: Transaction[]): void {
        this.allTransactions = _.sortBy(this.getTransactionDisplayItems(transactions), [(o) => o.transaction.date]);
        this.updateFilteredTransactions();
    }

    private updateFilteredTransactions(): void {
        //TODO: refactor this => similar to categories/transactions list
        this.filteredTransactions = this.allTransactions;
        if(this.filterText.length > 0) {
            this.filteredTransactions = this.allTransactions
            .filter((t) => { // TODO: filter logic
                let words = this.filterText.toLocaleLowerCase().split(/\s+/);
                return words.every((w) => {
                    return false
                        ||  (t.transaction.title && t.transaction.title.toLowerCase().includes(w))
                        ||  (t.category && t.category.name.toLowerCase().includes(w))
                        ||  (t.account && t.account.name.toLowerCase().includes(w));
                });
            });
        }

        this.totalSum = this.filteredTransactions
            .map(t => Math.round(t.displayAmount*100))
            .reduce((acc, t) => acc + t, 0)/100;

        let count = this.filteredTransactions.length;

        this.filteredAvg = count ? (this.totalSum / count) : 0;

        this.filteredMin = count ? Math.min(...this.filteredTransactions.map(t => t.displayAmount)) : 0;
        this.filteredMax = count ? Math.max(...this.filteredTransactions.map(t => t.displayAmount)) : 0;
    }

    private getTransactionDisplayItem(t: Transaction): TransactionDisplayItem {
        let x = new TransactionDisplayItem();
        x.transaction = t;
        x.account = this.accountsRepository.get(t.accountGuid);
        x.category = this.categoriesRepository.get(t.categoryGuid);

        x.transactionCurrencyCode = Currency[t.currency];
        x.displayAmount = t.amount;
        x.displayCurrencyCode = Currency[t.currency];

        let selectedCurrency = this.settingsRepository.getSelectedCurrency();
        if(selectedCurrency != t.currency) {
            let rate = this.exchangeRepository.getRate(t.currency, selectedCurrency);
            if(rate) {
                x.displayAmount = t.amount * rate;
                x.displayCurrencyCode = Currency[selectedCurrency];
            } else {
                console.log(`ERROR: Cannot find rate between currencies: ${t.currency} => ${selectedCurrency}`);
            }
        }

        return x;
    }

    private getTransactionDisplayItems(transactions: Transaction[]): TransactionDisplayItem[] {
        return transactions.map(t => this.getTransactionDisplayItem(t));
    }
}

export class TransactionDisplayItem {
    transaction: Transaction;
    category: Category = null;
    account: UserAccount = null;
    selected: boolean = false;
    transactionCurrencyCode: string = null;
    displayAmount: number = 0;
    displayCurrencyCode: string = null;
}