import { Component, OnInit } from '@angular/core';
import { ImportService } from '../import.service';
import { StagedTransaction } from '../stagedTransaction.model';
import * as _ from "lodash";

@Component({
  selector: 'app-transactions-list2',
  templateUrl: './transactions-list2.component.html'
})
export class TransactionsList2Component implements OnInit {

  stagedTransactions: StagedTransaction[] = [];

  private setStagedTransactions(arr: StagedTransaction[]) {
    this.stagedTransactions = arr;//_.sortBy(arr, (t) => !t.foundDuplicate);
  }

  constructor(private importService: ImportService) { }

  ngOnInit() {
    this.importService.stagedTransactionsChanged.subscribe((arr: StagedTransaction[]) => {
      this.setStagedTransactions(arr);
    });
    this.setStagedTransactions(this.importService.stagedTransactions);
  }

  onCheckChange() {
    this.importService.stagedTransactions = this.stagedTransactions;
  }
}
