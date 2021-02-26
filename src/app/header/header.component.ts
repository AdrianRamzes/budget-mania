import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver'
import { Currency } from '../models/currency.enum';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import { AuthService } from '../auth/auth.service';
import { AccountsRepository } from '../repositories/accounts.repository';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { SettingsRepository } from '../repositories/settings.repository';
import { CategoriesRepository } from '../repositories/categories.repository';
import { DataService } from '../data/data.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

    username: string = "";
    currencies: CurrencyDisplayItem[] = [];
    selectedCurrency: any = null;

    isLoading: boolean = false;
    isSaving: boolean = false;
    isDirty: boolean = false;

    private _filenamePrefix = "budget_mania_";

    constructor(
        private betterDataService: DataService,
        private accountsRepository: AccountsRepository,
        private transactionsRepository: TransactionsRepository,
        private settingsRepository: SettingsRepository,
        private categoriesRepository: CategoriesRepository,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.subscribe();

        Object.keys(Currency).forEach(k => {
            if (typeof (Currency[k]) === "number") {
                this.currencies.push(new CurrencyDisplayItem(k, Currency[k]));
            }
        });

        this.isDirty = this.betterDataService.isDirty;
        this.isLoading = this.betterDataService.loading;
        this.isSaving = this.betterDataService.saving;

        let c = this.settingsRepository.getSelectedCurrency();
        this.selectedCurrency = new CurrencyDisplayItem(Currency[c], c);
    }

    private subscribe(): void {
        this.settingsRepository.changed.subscribe(e => {
            let c = this.settingsRepository.getSelectedCurrency();
            this.selectedCurrency = new CurrencyDisplayItem(Currency[c], c);
        });

        this.betterDataService.isDirtyChanged.subscribe(x => this.isDirty = x);
        this.betterDataService.savingChanged.subscribe(x => this.isSaving = x);
        this.betterDataService.loadingChanged.subscribe(x => this.isLoading = x);
    }

    onSave() {
        this.betterDataService.save();
    }

    loadFile(event: EventTarget) {
        let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
        let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
        let files: FileList = target.files;
        this.load(files[0]);
    }

    onExportToCSVClick() {
        let transactions = this.transactionsRepository.list().map(t => {
            let account = this.accountsRepository.get(t.accountGuid);
            let category = this.categoriesRepository.get(t.categoryGuid);
            return {
                guid: t.guid,
                date: t.date ? moment(t.date).format("YYYY-MM-DD") : null,
                title: t.title,
                accountGuid: t.accountGuid,
                accountName: account ? account.name : null,
                amount: t.amount,
                categoryGuid: t.categoryGuid,
                categoryName: category ? category.name : null,
                currency: Currency[t.currency],
                IBAN: t.IBAN,
                sourceIBAN: t.sourceIBAN,
                destinationIBAN: t.destinationIBAN,
                importDate: t.importDate ? moment(t.importDate).format("YYYY-MM-DD") : null,
                importGuid: t.importGuid,
            }
        });

        let config: Papa.UnparseConfig = {
        }

        let unparsed = Papa.unparse(transactions, config);

        saveAs(new Blob([unparsed],
            { type: "text/csv;charset=utf-8" }),
            this._filenamePrefix + moment().format("YYYY-MM-DD-HH-mm-ss"));
    }

    onCurrencyChanged(c: CurrencyDisplayItem) {
        this.settingsRepository.setSelectedCurrency(c.value);
    }

    logout(): void {
        this.authService.logout();
    }

    private save(data: string) {
        saveAs(new Blob([data],
            { type: "text/plain;charset=utf-8" }),
            this._filenamePrefix + moment().format("YYYY-MM-DD-HH-mm-ss"));
    }

    private load(file: File) {
    }

    test() {
        let x = this.accountsRepository.list();
        console.log(x);

        let z = this.settingsRepository.all();
        console.log(z);

        let v = this.categoriesRepository.list();
        console.log(v);
    }
}

class CurrencyDisplayItem {
    code: string;
    value: number;

    constructor(code: string, value: number) {
        this.code = code;
        this.value = value;
    }
}