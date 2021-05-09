import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Currency } from 'src/app/models/currency.enum';
import { Transaction } from 'src/app/models/transaction.model';
import { AccountsRepository } from 'src/app/repositories/accounts.repository';
import { ExchangeRepository } from 'src/app/repositories/exchange.repository';
import { SettingsRepository } from 'src/app/repositories/settings.repository';
import { TransactionDisplayItem } from './transaction.displayitem';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

    constructor(
        private accountsRepository: AccountsRepository,
        private exchangeRepository: ExchangeRepository,
        private settingsRepository: SettingsRepository) {

    }
    private transacion: Transaction;
    @Input()
    set model(t: Transaction) {
        this.transacion = t;
        this.displayItem = new TransactionDisplayItem();
        this.displayItem.dateString = moment(t.date).format('YYYY-MM-DD');
        this.displayItem.accountName = this.accountsRepository.get(t.accountGuid)?.name;
        this.displayItem.information = t.information;
        this.displayItem.amount = t.amount;
        this.displayItem.originalAmount = t.amount;
        this.displayItem.currencyCode = Currency[t.currency];
        this.displayItem.originalCurrencyCode = Currency[t.currency];
        this.updateDisplayItem();
    }
    displayItem: TransactionDisplayItem;

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
    }

    onSelectionChange(event: any): void {
        this.displayItem.selected = event.target.checked;
        console.log(this.displayItem.selected);
    }

    private updateDisplayItem() {
        const selectedCurrency = this.settingsRepository.getSelectedCurrency();
        this.displayItem.currencyCode = Currency[selectedCurrency];
        const rate = this.exchangeRepository.getRate(this.transacion.currency, selectedCurrency);
        if (rate) {
            this.displayItem.amount = this.transacion.amount * rate;
        }
    }
}
