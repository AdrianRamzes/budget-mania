import * as _ from 'lodash';

import { Currency } from 'src/app/models/currency.enum';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SettingsRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private readonly _KEY: string = 'settings';

    private _SETTINGS: { [name: string]: any } = {};

    constructor() {
        this.load();
    }

    getSelectedCurrency(): Currency {
        return this.get(SettingsKeys.SELECTED_CURRENCY) || Currency.EUR;
    }

    setSelectedCurrency(c: Currency) {
        this.set(SettingsKeys.SELECTED_CURRENCY, c);
    }

    private load(): void {
        if (localStorage.getItem(this._KEY) !== null) {
            this._SETTINGS = JSON.parse(localStorage.getItem(this._KEY));
            // Emit change for all keys
            this.changed.emit(SettingsKeys.SELECTED_CURRENCY);
        } else {
            this._SETTINGS = {};
        }
    }

    private contains(key: string): boolean {
        return key in this._SETTINGS;
    }

    private get(key: string): any {
        return this.contains(key) ? this._SETTINGS[key] : null;
    }

    private set(name: string, value: any): void {
        this._SETTINGS[name] = value;
        localStorage.setItem(this._KEY, JSON.stringify(this._SETTINGS));
        this.changed.emit(name);
    }
}

export class SettingsKeys {
    static readonly SELECTED_CURRENCY: string = 'selected-currency';
}
