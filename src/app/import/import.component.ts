import * as _ from "lodash";

import { Component, OnInit } from '@angular/core';
import { ImportService } from './import.service';
import { StagedTransaction } from './stagedTransaction.model';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html'
})
export class ImportComponent implements OnInit {

    showTransactionsList: boolean = false;
    checkedTransactionsCount: number = 0;
    duplicateTransactionsCount: number = 0;
    isAccountSelected: boolean = false;

    constructor(private importService: ImportService) { }

    ngOnInit() {
        this.subscribe();
        this.initialize();
    }

    private subscribe(): void {
        this.importService.stagedTransactionsChanged.subscribe(data => this.onStagedTransactionsChanged(data));
        this.importService.selectedAccountChanged.subscribe(data => this.isAccountSelected = !!data)
    }

    private initialize(): void {
        this.showTransactionsList = this.importService.stagedTransactions.length > 0;
        this.checkedTransactionsCount = this.importService.stagedTransactions.length;
        this.duplicateTransactionsCount = 0
        this.isAccountSelected = !!this.importService.selectedAccount;
    }

    onStagedTransactionsChanged(data, context: ImportComponent = this) {
        context.showTransactionsList = data.length > 0;
        context.checkedTransactionsCount = _.filter(data, (st) => (st as StagedTransaction).checked).length;
        context.duplicateTransactionsCount = _.filter(data, (st) => (st as StagedTransaction).foundDuplicate).length;
    }

    onImportClick() {
        if(this.isAccountSelected && this.checkedTransactionsCount > 0)
            this.importService.import();
    }
}
