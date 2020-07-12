import * as _ from 'lodash';
import * as $ from 'jquery';

import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { DataService } from '../data/data.service';
import { Category } from '../models/category.model';
import { UserAccount } from '../models/user-account.model';
import { environment } from 'src/environments/environment';
import { Currency } from '../models/currency.enum';
import { CategoriesRepository } from '../data/repositories/categories.repository';
import { AccountsRepository } from '../data/repositories/accounts.repository';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {

    categories: Category[] = [];

    //allTransactions: Transaction[] = [];
    allTransactionDisplayItems: TransactionDisplayItem[] = [];
    filteredTransactions: TransactionDisplayItem[] = [];
    filter: string = "";
    isProduction: boolean = true;
    withoutCategory: boolean = false;

    displayCount: number = 10;

    constructor(private dataService: DataService,
                private categoriesRepository: CategoriesRepository,
                private accountsRepository: AccountsRepository) { }

    ngOnInit() {
        this.dataService.transactionsChanged.subscribe((e) => {
            //this.allTransactions = e;
            this.categories = this.categoriesRepository.list();
            this.allTransactionDisplayItems = this.getTransactionDisplayItems(e);
            this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
            this.updateSuggestedCategories();
        });

        //this.allTransactions = this.dataService.getTransactions();
        this.allTransactionDisplayItems = this.getTransactionDisplayItems(this.dataService.getTransactions());
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);

        this.categoriesRepository.changed.subscribe(c => this.categories = c);
        this.categories = this.categoriesRepository.list();

        this.isProduction = environment.production;

        this.updateSuggestedCategories();

        window.addEventListener('scroll', this.onScroll.bind(this));
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
            if (!!t.suggestedCategory)
                this.acceptSuggestedCategory(t);
        });
    }

    onCheckboxChange(e) {
        this.filteredTransactions = this.filterTransactions(this.allTransactionDisplayItems, this.filter);
    }


    onScroll(e: any) {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            this.loadMoreTransactions();
        }
    }

    private loadMoreTransactions(): void {
        this.displayCount = Math.min(this.displayCount + 10, this.filteredTransactions.length);
    }

    private filterTransactions(transactions: TransactionDisplayItem[], filter: string): TransactionDisplayItem[] {
        transactions = transactions
            .filter(t => this.withoutCategory ? !t.category : true);

        if (filter.length > 0) {
            transactions = transactions
                .filter((t) => { // TODO: filter logic
                    let words = filter.toLocaleLowerCase().split(/\s+/);
                    return words.every((w) => {
                        return false
                            || (t.transaction.title && t.transaction.title.toLowerCase().includes(w))
                            || (t.category && t.category.name.toLowerCase().includes(w))
                            || (t.account && t.account.name.toLowerCase().includes(w));
                    });
                });
        }

        return transactions;
    }

    private getTransactionDisplayItems(transactions: Transaction[]) {
        return transactions.map((t) => {
            let trans = new TransactionDisplayItem();
            trans.transaction = t;
            trans.currencyCode = Currency[t.currency];
            if (t.accountGuid) {
                trans.account = this.accountsRepository.get(t.accountGuid);
            }
            if (t.categoryGuid) {
                trans.category = this.categoriesRepository.get(t.categoryGuid);
            }
            return trans;
        });
    }

    onRemoveAllTransactionsClick(): void {
        if (!this.isProduction)
            this.dataService.removeTransactions(this.dataService.getTransactions());
    }

    onDumpAllDataClick(): void {
        if (!this.isProduction)
            this.dataService.dump();
    }

    private acceptSuggestedCategory(t: TransactionDisplayItem) {
        if (!t.transaction.categoryGuid) {
            t.transaction.categoryGuid = t.suggestedCategory.guid;
            this.dataService.editTransaction(t.transaction);
        }
    }

    private updateSuggestedCategories() {
        let withCategory = _.filter(this.dataService.getTransactions(), x => !!x.categoryGuid);
        this.allTransactionDisplayItems.forEach(t => {
            if (!t.transaction.categoryGuid) {
                let candidate = _.find(withCategory, x => x.title == t.transaction.title)
                if (candidate) {
                    t.suggestedCategory = this.categoriesRepository.get(candidate.categoryGuid);
                }
            }
        });
        return;
    }
}

export class TransactionDisplayItem {
    transaction: Transaction;
    currencyCode: string = null;
    category: Category = null;
    account: UserAccount = null;
    suggestedCategory: Category = null;
    selected: boolean = false;
}