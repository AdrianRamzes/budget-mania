import * as _ from "lodash";

import { BetterDataService } from '../betterdata.service';
import { EventEmitter, Injectable } from '@angular/core';
import { Currency } from 'src/app/models/currency.enum';

@Injectable({providedIn: 'root'})
export class SettingsRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private readonly _KEY: string = "settings";

    private _settings: { [name: string]: any } = null;

    constructor(private betterDataService: BetterDataService) {

        this.betterDataService.dataChanged.subscribe(key => {
            if (key == this._KEY) {
                this.load();
                this.changed.emit(this._settings);
            }
        })
    }

    all(): { [name: string]: string } {
        return this._settings;
    }

    get(name: string): string {
        if(name in this._settings) {
            return this._settings[name];
        }
        return null;
    }

    set(name: string, value: string): void {
        this._settings[name] = value;
    }

    remove(name: string) {
        delete this._settings[name];
    }

    getSelectedCurrency(): Currency {
        return this._settings && parseInt(this._settings[SettingsKeys.SELECTED_CURRENCY]) || Currency.EUR;
    }
    setSelectedCurrency(c: Currency) {
        if(!this._settings) {
            this._settings = {};
        }
        this._settings[SettingsKeys.SELECTED_CURRENCY] = c;
        this.betterDataService.set(this._KEY, c)
        this.changed.emit(SettingsKeys.SELECTED_CURRENCY);
    }

    private load(): void {
        if (this.betterDataService.containsKey(this._KEY)) {
            let jsonStr = this.betterDataService.get(this._KEY);
            this._settings = this.deserialize(jsonStr);
        } else {
            this._settings = {};
        }
    }

    private deserialize(deserialized: any): { [name: string]: string } {
        return deserialized || {}
    }
}

export class SettingsKeys {
    static readonly SELECTED_CURRENCY: string = "selected-currency";
}