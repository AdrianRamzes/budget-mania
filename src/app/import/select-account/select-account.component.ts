import { Component, OnInit } from '@angular/core';
import { ImportService } from '../import.service';
import { UserAccount } from 'src/app/models/user-account.model';
import { __importDefault } from 'tslib';

@Component({
  selector: 'app-select-account',
  templateUrl: './select-account.component.html'
})
export class SelectAccountComponent implements OnInit {

  accounts: UserAccount[] = [];

  selectedAccount: UserAccount;

  constructor(private importService: ImportService) {
  }

  ngOnInit() {
    this.importService.accountsChanges.subscribe((arr) => this.accounts = arr);
    this.importService.selectedAccountChanged.subscribe((a) => this.selectedAccount = a);

    this.accounts = this.importService.accounts;
    this.selectedAccount = this.importService.selectedAccount;
  }

  onSelectedAccountChange(): void {
    this.importService.selectedAccount = this.selectedAccount;
  }
}
