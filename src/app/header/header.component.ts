import { Component, OnInit } from '@angular/core';
import { Currency } from '../models/currency.enum';
import { AuthService } from '../auth/auth.service';
import { SettingsRepository } from '../repositories/settings.repository';
import { DataService, DataServiceState } from '../data/data.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

    username = '';
    currencies: CurrencyDisplayItem[] = [];
    selectedCurrency: any = null;

    dataServiceState: DataServiceState = DataServiceState.Uninitialized;
    get isLoading() {
        return this.dataService.state === DataServiceState.Loading;
    }
    get isDirty() {
        return this.dataService.state === DataServiceState.Dirty;
    }
    get isSaving() {
        return this.dataService.state === DataServiceState.Saving;
    }

    constructor(
        private dataService: DataService,
        private settingsRepository: SettingsRepository,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.subscribe();

        Object.keys(Currency).forEach(k => {
            if (typeof (Currency[k]) === 'number') {
                this.currencies.push(new CurrencyDisplayItem(k, Currency[k]));
            }
        });

        this.dataServiceState = this.dataService.state;

        const c = this.settingsRepository.getSelectedCurrency();
        this.selectedCurrency = new CurrencyDisplayItem(Currency[c], c);
    }

    private subscribe(): void {
        this.settingsRepository.changed.subscribe(e => {
            const c = this.settingsRepository.getSelectedCurrency();
            this.selectedCurrency = new CurrencyDisplayItem(Currency[c], c);
        });

        this.dataService.stateChanged.subscribe(x => this.dataServiceState = x);
    }

    onSave() {
        this.dataService.save();
    }

    onCurrencyChanged(c: CurrencyDisplayItem) {
        this.settingsRepository.setSelectedCurrency(c.value);
    }

    logout(): void {
        this.authService.logout();
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