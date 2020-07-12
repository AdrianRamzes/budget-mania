import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { DataService } from '../data/data.service';
import { TransactionsRepository } from '../data/repositories/transactions.repository';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

    transactions: Transaction[] = [];

    constructor(private dataService: DataService,
                private transactionsRepository: TransactionsRepository) { }

    ngOnInit() {
        this.transactionsRepository.changed.subscribe((e) => this.transactions = e)
        this.transactions = this.transactionsRepository.list();
    }
}
