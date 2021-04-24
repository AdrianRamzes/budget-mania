import * as _ from "lodash";

import { Currency } from 'src/app/models/currency.enum';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SettingsRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private readonly _KEY: string = 'settings';

    private _SETTINGS: { [name: string]: any } = null;

    constructor() {
        this.load();
    }

    all(): { [name: string]: string } {
        return this._SETTINGS;
    }

    get(name: string): string {
        if (name in this._SETTINGS) {
            return this._SETTINGS[name];
        }
        return null;
    }

    set(name: string, value: any): void {
        this._SETTINGS[name] = value;
        localStorage.setItem(this._KEY, JSON.stringify(this._SETTINGS));
        this.emitChanges();
    }

    remove(name: string) {
        delete this._SETTINGS[name];
        localStorage.setItem(this._KEY, JSON.stringify(this._SETTINGS));
        this.emitChanges();
    }

    getSelectedCurrency(): Currency {
        if (this._SETTINGS && SettingsKeys.SELECTED_CURRENCY in this._SETTINGS) {
            return parseInt(this._SETTINGS[SettingsKeys.SELECTED_CURRENCY], 10);
        }
        return Currency.EUR;
    }
    setSelectedCurrency(c: Currency) {
        if (!this._SETTINGS) {
            this._SETTINGS = {};
        }
        this.set(SettingsKeys.SELECTED_CURRENCY, c);
    }

    private emitChanges() {
        // TODO: check differentce and emit changes
        // for now - emit change for every key
        for (const key in this._SETTINGS) {
            this.changed.emit(key);
        }
    }

    private load(): void {
        if (localStorage.getItem(this._KEY) !== null) {
            this._SETTINGS = JSON.parse(localStorage.getItem(this._KEY));
            this.emitChanges();
        } else {
            this._SETTINGS = {};
        }
    }

    private deserialize(deserialized: any): { [name: string]: string } {
        return deserialized || {};
    }
}

export class SettingsKeys {
    static readonly SELECTED_CURRENCY: string = 'selected-currency';
}
