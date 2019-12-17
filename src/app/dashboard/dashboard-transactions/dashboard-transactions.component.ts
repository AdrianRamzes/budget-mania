import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';

@Component({
  selector: 'app-dashboard-transactions',
  templateUrl: './dashboard-transactions.component.html'
})
export class DashboardTransactionsComponent implements OnInit {

  @Input() transactions: Transaction[] = [];

  constructor() { }

  ngOnInit() {
  }

}
