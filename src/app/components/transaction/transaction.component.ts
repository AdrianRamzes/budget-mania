import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Categories, Category } from 'src/app/models/category.model';
import { Currency } from 'src/app/models/currency.enum';
import { Transaction } from 'src/app/models/transaction.model';
import { AccountsRepository } from 'src/app/repositories/accounts.repository';
import { ExchangeRepository } from 'src/app/repositories/exchange.repository';
import { SettingsRepository } from 'src/app/repositories/settings.repository';
import { TransactionsRepository } from 'src/app/repositories/transactions.repository';
import { TransactionDisplayItem } from './transaction.displayitem';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css', './categories.css']
})
export class TransactionComponent implements OnInit {

    constructor(
        private transactionsRepository: TransactionsRepository,
        private accountsRepository: AccountsRepository,
        private exchangeRepository: ExchangeRepository,
        private settingsRepository: SettingsRepository) {
    }

    transaction: Transaction;

    @Input()
    set model(t: Transaction) {
        this.displayItem = new TransactionDisplayItem();
        this.transaction = t;
        this.displayItem.dateString = moment(t.date).format('YYYY-MM-DD');
        this.displayItem.accountName = this.accountsRepository.get(t.accountGuid)?.name;
        this.displayItem.information = t.information;
        this.displayItem.amount = t.amount;
        this.displayItem.originalAmount = t.amount;
        this.displayItem.currencyCode = Currency[t.currency];
        this.displayItem.originalCurrencyCode = Currency[t.currency];
        this.selectedCategory = Categories.get(t.categoryGuid);
        this.updateDisplayItem();
    }
    displayItem: TransactionDisplayItem;

    categories: Category[] = [];
    _selectedCategory: Category;
    _noCategory: Category = {
        guid: null,
        name: 'No Category',
        className: 'category-no-category',
        subcategories: [],
    };
    get selectedCategory() {
        return this._selectedCategory ?? this._noCategory;
    }
    set selectedCategory(value: Category) {
        this._selectedCategory = value;
    }

    @Input()
    selectable: boolean;

    @Input()
    editable: boolean;

    @Input()
    removable: boolean;

    ngOnInit(): void {
        this.exchangeRepository.changed.subscribe(() => {
            this.updateDisplayItem();
        });
        this.settingsRepository.changed.subscribe(() => {
            this.updateDisplayItem();
        });
        this.categories = Categories.getAll();
    }

    onSelectionChange(event: any): void {
        this.displayItem.selected = event.target.checked;
        console.log(this.displayItem.selected);
    }

    onSelectedCategoryChange(): void {
        this.transaction.categoryGuid = this._selectedCategory.guid;
        this.transactionsRepository.edit(this.transaction);
    }

    onRemoveClick() {
        console.log(`remove ${this.transaction.guid}`);
    }

    private updateDisplayItem() {
        const selectedCurrency = this.settingsRepository.getSelectedCurrency();
        this.displayItem.currencyCode = Currency[selectedCurrency];
        const rate = this.exchangeRepository.getRate(this.transaction.currency, selectedCurrency);
        if (rate) {
            this.displayItem.amount = this.transaction.amount * rate;
        }
    }
}
