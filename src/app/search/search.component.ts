import * as $ from 'jquery';
import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';
import { Categories, Category } from 'src/app/models/category.model';
import { TransactionsAccount } from 'src/app/models/transactions-account.model';
import { Currency } from 'src/app/models/currency.enum';
import { SettingsRepository } from 'src/app/repositories/settings.repository';
import { ExchangeRepository } from 'src/app/repositories/exchange.repository';
import { AccountsRepository } from 'src/app/repositories/accounts.repository';
import { TransactionsRepository } from 'src/app/repositories/transactions.repository';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    allTransactions: TransactionDisplayItem[] = [];
    filteredTransactions: TransactionDisplayItem[] = [];

    get transactions2(): Transaction[] {
        return this.filteredTransactions.map(x => x.transaction);
    }

    filterText = '';
    displayCount = 25; // TODO: Solve it for big screens? Button or detection?
    totalSum = 0;
    filteredAvg = 0;
    filteredMin = 0;
    filteredMax = 0;

    constructor(
        private transactionsRepository: TransactionsRepository,
        private accountsRepository: AccountsRepository,
        private settingsRepository: SettingsRepository,
        private exchangeRepository: ExchangeRepository) {
    }

    ngOnInit() {
        this.transactionsRepository.changed.subscribe(() => {
            this.updateDisplayedTransactions(this.transactionsRepository.list());
        });
        // this.settingsRepository.changed.subscribe(() => {
        //     this.updateDisplayedTransactions(this.transactionsRepository.list());
        // });
        // this.exchangeRepository.changed.subscribe(() => {
        //     this.updateDisplayedTransactions(this.transactionsRepository.list());
        // });

        this.updateDisplayedTransactions(this.transactionsRepository.list());
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onFilterChange(text) {
        this.updateFilteredTransactions();
    }

    onScroll(e: any) {
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
            this.loadMoreTransactions();
        }
    }

    onLoadMoreClick() {
        this.loadMoreTransactions();
    }

    private loadMoreTransactions(): void {
        this.displayCount = Math.min(this.displayCount + 10, this.filteredTransactions.length);
    }

    private updateDisplayedTransactions(transactions: Transaction[]): void {
        this.allTransactions = _.sortBy(this.getTransactionDisplayItems(transactions), [(o) => o.transaction.date]).reverse();
        this.updateFilteredTransactions();
    }

    private updateFilteredTransactions(): void {
        // TODO: refactor this => similar to categories/transactions list
        this.filteredTransactions = this.allTransactions;
        if (this.filterText.length > 0) {
            this.filteredTransactions = this.allTransactions
                .filter((t) => { // TODO: filter logic
                    const words = this.filterText.toLocaleLowerCase().split(/\s+/);
                    return words.every((w) => {
                        return false
                            || (t.transaction.information && t.transaction.information.toLowerCase().includes(w))
                            || (t.category && t.category.name.toLowerCase().includes(w))
                            || (t.account && t.account.name.toLowerCase().includes(w));
                    });
                });
        }

        this.totalSum = this.filteredTransactions
            .map(t => Math.round(t.displayAmount * 100))
            .reduce((acc, t) => acc + t, 0) / 100;

        const count = this.filteredTransactions.length;

        this.filteredAvg = count ? (this.totalSum / count) : 0;

        this.filteredMin = count ? Math.min(...this.filteredTransactions.map(t => t.displayAmount)) : 0;
        this.filteredMax = count ? Math.max(...this.filteredTransactions.map(t => t.displayAmount)) : 0;
    }

    private getTransactionDisplayItem(t: Transaction): TransactionDisplayItem {
        const x = new TransactionDisplayItem();
        x.transaction = t;
        x.account = this.accountsRepository.get(t.accountGuid);
        x.category = Categories.get(t.categoryGuid);

        x.transactionCurrencyCode = Currency[t.currency];
        x.displayAmount = t.amount;
        x.displayCurrencyCode = Currency[t.currency];

        const selectedCurrency = this.settingsRepository.getSelectedCurrency();
        if (selectedCurrency !== t.currency) {
            const rate = this.exchangeRepository.getRate(t.currency, selectedCurrency);
            if (rate) {
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
    account: TransactionsAccount = null;
    selected = false;
    transactionCurrencyCode: string = null;
    displayAmount = 0;
    displayCurrencyCode: string = null;
}
