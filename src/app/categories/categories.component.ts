import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { DataService } from '../data/data.service';
import { Category } from '../models/category.model';
import { UserAccount } from '../models/user-account.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {

    categories: Category[] = [];

    allTransactions: Transaction[] = [];
    allTransactionDisplayItems: TransactionDisplayItem[] = [];
    filteredTransactions: TransactionDisplayItem[] = [];
    filter: string = "";
    isProduction: boolean = true;

    constructor(private dataService: DataService) { }

    ngOnInit() {
        let self = this;
        this.dataService.transactionsChanged.subscribe((e) => { 
            self.allTransactions = e;
            self.allTransactionDisplayItems = this.getTransactionDisplayItems(e);
            self.filteredTransactions = self.filterTransactions(this.allTransactionDisplayItems, self.filter)
        });

        this.allTransactions = this.dataService.getTransactions();
        this.allTransactionDisplayItems = this.getTransactionDisplayItems(this.allTransactions);
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);

        this.dataService.categoriesChanged.subscribe(c => this.categories = c);
        this.categories = this.dataService.getCategories();

        this.isProduction = environment.production;
    }

    onFilterChange(f: string) {
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
    }

    onCategoryChange(t: Transaction, e: string) {
        t.categoryGuid = e;
        this.dataService.editTransaction(t);
        this.updateSuggestedCategories(t);
    }

    updateSuggestedCategories(changedTransaction: Transaction) {
        if(!changedTransaction.categoryGuid) return;
        this.filteredTransactions.forEach(t => {
            if(t.transaction.guid != changedTransaction.guid && !t.transaction.categoryGuid) {
                if(t.transaction.title == changedTransaction.title) {
                    t.suggestedCategory = this.dataService.getCategory(changedTransaction.categoryGuid);
                }
            }
        });
    }

    onSuggestedCategoryClick(t: TransactionDisplayItem) {
        if(!t.transaction.categoryGuid) {
            t.transaction.categoryGuid = t.suggestedCategory.guid;
            this.dataService.editTransaction(t.transaction);
        }
    }

    filterTransactions(transactions: TransactionDisplayItem[], filter: string): TransactionDisplayItem[] {
        if(filter.length == 0) return transactions;
        return transactions.filter((t) => { // TODO: filter logic
            let words = filter.toLocaleLowerCase().split(/\s+/);
            return words.every((w) => {
                return false
                    ||  (t.transaction.title && t.transaction.title.toLowerCase().includes(w))
                    ||  (t.category && t.category.name.toLowerCase().includes(w))
                    ||  (t.account && t.account.name.toLowerCase().includes(w));
            });
        });
    }

    getTransactionDisplayItems(transactions: Transaction[]) {
        return transactions.map((t) => {
            let trans = new TransactionDisplayItem();
            trans.transaction = t;
            if(t.accountGuid) {
                trans.account = this.dataService.getAccount(t.accountGuid);
            }
            if(t.categoryGuid) {
                trans.category = this.dataService.getCategory(t.categoryGuid);
            }
            return trans;
        });
    }

    onRemoveAllTransactionsClick(): void {
        if(!this.isProduction)
            this.dataService.removeTransactions(this.dataService.getTransactions());
    }

    onDumpAllDataClick(): void {
        if(!this.isProduction)
            this.dataService.dump();
    }
}

export class TransactionDisplayItem {
    transaction: Transaction;
    category: Category = null;
    account: UserAccount = null;
    suggestedCategory: Category = null;
    selected: boolean = false;
}