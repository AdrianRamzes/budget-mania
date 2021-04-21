import * as _ from "lodash";

import { Currency } from 'src/app/models/currency.enum';
import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SettingsRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private readonly _KEY: string = 'settings';

    private _SETTINGS: { [name: string]: any } = null;

    constructor(private dataService: DataService) {
        this.dataService.dataChanged.subscribe(key => {
            if (key === this._KEY) {
                this.load();
            }
        });
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
        this.dataService.set(this._KEY, this._SETTINGS);
    }

    remove(name: string) {
        delete this._SETTINGS[name];
        this.dataService.set(this._KEY, this._SETTINGS);
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

    private load(): void {
        if (this.dataService.containsKey(this._KEY)) {
            this._SETTINGS = this.dataService.get(this._KEY);
            // TODO: check differentce and emit changes
            // for now - emit change for every key
            for(const key in this._SETTINGS) {
                this.changed.emit(key);
            }
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
