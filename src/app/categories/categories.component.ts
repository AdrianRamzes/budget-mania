import * as _ from "lodash";

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
    withoutCategory: boolean = false;

    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.dataService.transactionsChanged.subscribe((e) => { 
            this.allTransactions = e;
            this.categories = this.dataService.getCategories();
            this.allTransactionDisplayItems = this.getTransactionDisplayItems(e);
            this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
            this.updateSuggestedCategories();
        });

        this.allTransactions = this.dataService.getTransactions();
        this.allTransactionDisplayItems = this.getTransactionDisplayItems(this.allTransactions);
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);

        this.dataService.categoriesChanged.subscribe(c => this.categories = c);
        this.categories = this.dataService.getCategories();

        this.isProduction = environment.production;

        this.updateSuggestedCategories();
    }

    onFilterChange(f: string) {
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
    }

    onCategoryChange(t: Transaction, e: string) {
        t.categoryGuid = e;
        this.dataService.editTransaction(t);
    }

    onSuggestedCategoryClick(t: TransactionDisplayItem) {
        this.acceptSuggestedCategory(t);
    }

    onAcceptAllSugestionsClick() {
        this.filteredTransactions.forEach(t => {
            if(!!t.suggestedCategory)
                this.acceptSuggestedCategory(t);
        });
    }

    onCheckboxChange() {
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
    }

    filterTransactions(transactions: TransactionDisplayItem[], filter: string): TransactionDisplayItem[] {
        transactions = transactions
            .filter(t => this.withoutCategory ? !t.category : true);

        if(filter.length == 0) return transactions;

        return transactions
        .filter((t) => { // TODO: filter logic
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

    private acceptSuggestedCategory(t: TransactionDisplayItem) {
        if(!t.transaction.categoryGuid) {
            t.transaction.categoryGuid = t.suggestedCategory.guid;
            this.dataService.editTransaction(t.transaction);
        }
    }

    private updateSuggestedCategories() {
        let withCategory = _.filter(this.allTransactions, x => !!x.categoryGuid);
        this.allTransactionDisplayItems.forEach(t => {
            if(!t.transaction.categoryGuid) {
                let candidate = _.find(withCategory, x => x.title == t.transaction.title)
                if(candidate) {
                    t.suggestedCategory = this.dataService.getCategory(candidate.categoryGuid);
                }
            }
        });
        return;
    }
}

export class TransactionDisplayItem {
    transaction: Transaction;
    category: Category = null;
    account: UserAccount = null;
    suggestedCategory: Category = null;
    selected: boolean = false;
}