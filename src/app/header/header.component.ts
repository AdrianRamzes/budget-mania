import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver'
import { DataService } from '../data/data.service';
import { Currency } from '../models/currency.enum';
import * as moment from 'moment';
import * as Papa from 'papaparse';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

    isDirty: boolean = false;

    private _filenamePrefix = "budget_mania_";

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.subscribe();

        this.isDirty = false;
    }

    private subscribe(): void {
        this.dataService.accountsChanged.subscribe(e => this.isDirty = true);
        this.dataService.categoriesChanged.subscribe(e => this.isDirty = true);
        this.dataService.transactionsChanged.subscribe(e => this.isDirty = true);
    }

    private unsubscribe() {
        this.dataService.accountsChanged.unsubscribe();
        this.dataService.categoriesChanged.unsubscribe();
        this.dataService.transactionsChanged.unsubscribe();
    }

    onSave() {
        this.save(this.dataService.serialize());
    }

    loadFile(event: EventTarget) {
        let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
        let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
        let files: FileList = target.files;
        this.load(files[0]);
    }

    onExportToCSVClick() {
        let transactions = this.dataService.getTransactions().map(t => {
            let account = this.dataService.getAccount(t.accountGuid);
            let category = this.dataService.getCategory(t.categoryGuid);
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

    private save(data: string) {
        saveAs(new Blob([data], 
            { type: "text/plain;charset=utf-8" }),
            this._filenamePrefix + moment().format("YYYY-MM-DD-HH-mm-ss"));
        this.isDirty = false;
    }

    private load(file: File) {
        let fr: FileReader = new FileReader();
        fr.onload = (data) => {
            let jsonString = fr.result as string;
            this.dataService.setDataFromString(jsonString, true);
            this.isDirty = false;
        }
        fr.readAsText(file, "utf-8");
    }
}
