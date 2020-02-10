import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';
import { Category } from 'src/app/models/category.model';
import { UserAccount } from 'src/app/models/user-account.model';
import { DataService } from 'src/app/data/data.service';

@Component({
    selector: 'app-dashboard-transactions',
    templateUrl: './dashboard-transactions.component.html'
})
export class DashboardTransactionsComponent implements OnInit {

    allTransactions: TransactionDisplayItem[] = [];
    filteredTransactions: TransactionDisplayItem[] = [];

    filterText: string = "";
    displayCount: number = 10;
    totalSum: number = 0;
    filteredAvg: number = 0;
    filteredMin: number = 0;
    filteredMax: number = 0;

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.dataService.transactionsChanged.subscribe(e => this.updateDisplayedTransactions(e));
        this.dataService.selectedCurrencyChanged.subscribe(e => {
            this.updateDisplayedTransactions(this.dataService.getTransactions());
        });

        this.updateDisplayedTransactions(this.dataService.getTransactions());
    }

    onFilterChange(text) {
        this.updateFilteredTransactions();
    }

    onLoadMoreClick() {
        this.displayCount = Math.min(this.displayCount+10, this.filteredTransactions.length);
        this.updateFilteredTransactions();
    }

    private updateDisplayedTransactions(transactions: Transaction[]): void {
        this.allTransactions = this.getTransactionDisplayItems(transactions);
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
            .map(t => Math.round(t.amount*100))
            .reduce((acc, t) => acc + t, 0)/100;

        let count = this.filteredTransactions.length;

        this.filteredAvg = count ? (this.totalSum / count) : 0;

        this.filteredMin = count ? Math.min(...this.filteredTransactions.map(t => t.amount)) : 0;
        this.filteredMax = count ? Math.max(...this.filteredTransactions.map(t => t.amount)) : 0;
    }

    private getTransactionDisplayItem(t: Transaction): TransactionDisplayItem {
        let x = new TransactionDisplayItem();
        x.transaction = t;
        let rate = this.dataService.getExchangeRate(t.currency, this.dataService.getSelectedCurrency());
        x.amount = t.amount * (rate ? rate : 1);
        x.account = this.dataService.getAccount(t.accountGuid);
        x.category = this.dataService.getCategory(t.categoryGuid);
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
    amount: number = 0;
}