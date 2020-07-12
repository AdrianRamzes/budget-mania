import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { UserAccount } from '../models/user-account.model';
import { NgForm } from '@angular/forms';
import { Currency } from '../models/currency.enum';
import { AccountsRepository } from '../data/repositories/accounts.repository';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html'
})
export class AccountsComponent implements OnInit {

    accounts: UserAccount[] = [];
    selectedAccount: UserAccount;

    currencies: CurrencyDisplayItem[] = [];

    constructor(private dataService: DataService,
                private accountsRepository: AccountsRepository) { }

    ngOnInit() {
        this.accountsRepository.changed.subscribe((a) => this.accounts = a);
        this.accounts = this.accountsRepository.list();

        Object.keys(Currency).forEach(k => {
            if (typeof (Currency[k]) === "number") {
                this.currencies.push(new CurrencyDisplayItem(k, Currency[k]));
            }
        });
    }

    onAccountSelected(a: UserAccount) {
        this.selectedAccount = a;
    }

    onSubmitNewAccount(form: NgForm) {
        let v = form.value;

        if(form.invalid) {
            //TODO: SET ERROR; migrate to reactive forms https://angular.io/guide/reactive-forms
            return;
        }
        
        let acc = new UserAccount();
        acc.IBAN = v.IBAN;
        acc.name = v.name;
        acc.fullName = v.fullName;
        acc.currency = v.currency && parseInt(v.currency);
        acc.bankName = v.bankName;

        this.accountsRepository.add(acc);

        form.resetForm();
    }

    onEditAccountClick(form: NgForm) {
        if (form.dirty) {
            let edited = {
                ...this.selectedAccount,
                ...form.value
            } as UserAccount;
            edited.currency = parseInt(form.value.currency);
            this.accountsRepository.edit(edited);
        }
    }

    onRemoveAccountClick() {
        this.accountsRepository.remove(this.selectedAccount);
    }

    currencyToSelectOption(c: Currency): CurrencyDisplayItem {
        return new CurrencyDisplayItem(Currency[c], c);
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