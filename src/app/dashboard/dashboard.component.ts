import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  transactions: Transaction[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.transactionsChanged.subscribe((e) => this.transactions = e)
    this.transactions = this.dataService.getTransactions();
  }

}
