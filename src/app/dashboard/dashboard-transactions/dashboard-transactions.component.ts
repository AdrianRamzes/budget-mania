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

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.dataService.transactionsChanged.subscribe(e => this.updateDisplayedTransactions(e));
        this.updateDisplayedTransactions(this.dataService.getTransactions());
    }

    onFilterChange(text) {
        this.updateFilteredTransactions();
    }

    onLoadMoreClick() {
        this.displayCount = Math.min(this.displayCount+10, this.allTransactions.length);
        this.updateFilteredTransactions();
    }

    private updateDisplayedTransactions(transactions: Transaction[]): void {
        this.allTransactions = this.getTransactionDisplayItems(transactions);
        this.updateFilteredTransactions();
    }

    private updateFilteredTransactions(): void {
        //count = Math.min(count, this.allTransactions.length);
        this.filteredTransactions = this.allTransactions.filter(t => {
            return true;
        });
    }

    private getTransactionDisplayItem(t: Transaction): TransactionDisplayItem {
        let x = new TransactionDisplayItem();
        x.transaction = t;
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
}