import * as $ from 'jquery';
import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';
import { Categories } from 'src/app/models/category.model';
import { AccountsRepository } from 'src/app/repositories/accounts.repository';
import { TransactionsRepository } from 'src/app/repositories/transactions.repository';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    allTransactions: Transaction[] = [];
    filteredTransactions: Transaction[] = [];

    filterText = '';
    displayCount = 25; // TODO: Solve it for big screens? Button or detection?
    totalSum = 0;
    filteredAvg = 0;
    filteredMin = 0;
    filteredMax = 0;

    constructor(
        private transactionsRepository: TransactionsRepository,
        private accountsRepository: AccountsRepository) {
    }

    ngOnInit() {
        this.transactionsRepository.changed.subscribe(() => {
            this.updateDisplayedTransactions(this.transactionsRepository.list());
        });

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
        this.allTransactions = _.sortBy(transactions, [(o) => o.date]).reverse();
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
                        const category = Categories.get(t.categoryGuid);
                        const account = this.accountsRepository.get(t.accountGuid);
                        return false
                            || (t.information && t.information.toLowerCase().includes(w))
                            || (category && category.name.toLowerCase().includes(w))
                            || (account && account.name.toLowerCase().includes(w));
                    });
                });
        }

        this.totalSum = this.filteredTransactions
            .map(t => Math.round(t.amount * 100))
            .reduce((acc, t) => acc + t, 0) / 100;

        const count = this.filteredTransactions.length;
    }
}
