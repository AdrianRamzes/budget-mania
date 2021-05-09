import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction.model';

@Component({
    selector: 'app-transactions-list',
    templateUrl: './transactions-list.component.html',
    styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

    constructor() { }

    @Input()
    transactions: Transaction[];

    @Input()
    selectable: boolean;

    @Input()
    editable: boolean;

    @Input()
    removable: boolean;

    ngOnInit(): void {
    }

}
