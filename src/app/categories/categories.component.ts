import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { DataService } from '../data/data.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {

    categories: Category[] = [];

    filteredTransactions: Transaction[] = [];
    filter: string = "";

    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.dataService.transactionsChanged.subscribe((e) => { this.filteredTransactions = this.filterTransactions(e, this.filter) });
        this.filteredTransactions = this.filterTransactions(this.dataService.getTransactions(), this.filter);

        this.categories = this.dataService.getCategories();
    }

    onFilterChange(f: string) {
        this.filteredTransactions = this.filterTransactions(this.dataService.getTransactions(), this.filter);
    }

    onCategoryChange(t: Transaction, e: string) {
        t.categoryName = e;
        this.dataService.editTransaction(t);
    }

    filterTransactions(transactions: Transaction[], filter: string): Transaction[] {
        if(filter.length == 0) return transactions;
        return transactions.filter((t) => { // TODO: filter logic
            let words = filter.toLocaleLowerCase().split(/\s+/);
            return words.every((w) => {
                return t.title.toLowerCase().includes(w)
                    || t.categoryName.toLowerCase().includes(w);
            });
        });
    }
}
