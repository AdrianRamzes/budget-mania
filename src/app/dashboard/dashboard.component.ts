import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { TransactionsRepository } from '../repositories/transactions.repository';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

    transactions: Transaction[] = [];

    constructor(private transactionsRepository: TransactionsRepository) { }

    ngOnInit() {
        this.transactionsRepository.changed.subscribe(() => this.transactions = this.transactionsRepository.list());
        this.transactions = this.transactionsRepository.list();
    }
}
