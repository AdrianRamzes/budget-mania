import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { UserAccount } from '../models/user-account.model';
import { NgForm } from '@angular/forms';
import { Currency } from '../models/currency.enum';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html'
})
export class AccountsComponent implements OnInit {

    accounts: UserAccount[] = [];
    selectedAccount: UserAccount;

    currencies: { symbol: string, value: number }[] = [];

    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.dataService.accountsChanged.subscribe((a) => this.accounts = a);
        this.accounts = this.dataService.getAccounts();

        Object.keys(Currency).forEach(k => {
            if (typeof (Currency[k]) === "number") {
                this.currencies.push({ symbol: k, value: Currency[k] });
            }
        });
    }

    onAccountSelected(a: UserAccount) {
        this.selectedAccount = a;
    }

    onSubmitNewAccount(form: NgForm) {
        let v = form.value;
        this.dataService.addAccount({
            IBAN: v.IBAN,
            name: v.name,
            fullName: v.fullName,
            currency: v.currency && parseInt(v.currency),
            bankName: v.bankName,
        } as UserAccount);
        form.resetForm();
    }

    onEditAccountClick(form: NgForm) {
        if (form.dirty) {
            let edited = {
                ...this.selectedAccount,
                ...form.value
            } as UserAccount;
            edited.currency = parseInt(form.value.currency);
            this.dataService.editAccount(edited);
        }
    }

    onRemoveAccountClick() {
        this.dataService.removeAccount(this.selectedAccount);
    }

    currencyToSelectOption(c: Currency): { symbol: string, value: number } {
        return { symbol: Currency[c], value: c };
    }
}
