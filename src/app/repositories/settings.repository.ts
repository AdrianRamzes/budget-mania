import * as _ from "lodash";

import { Currency } from 'src/app/models/currency.enum';
import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SettingsRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private readonly _KEY: string = "settings";

    private _settings: { [name: string]: any } = null;

    constructor(private dataService: DataService) {
        this.dataService.dataChanged.subscribe(key => {
            if (key == this._KEY) {
                this.load();
            }
        });
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

    set(name: string, value: any): void {
        this._settings[name] = value;
        this.dataService.set(this._KEY, this._settings);
        //this.changed.emit(name);//TODO: remove it and build mechanism to compare changes emited from dataservice
    }

    remove(name: string) {
        delete this._settings[name];
    }

    getSelectedCurrency(): Currency {
        if(this._settings && SettingsKeys.SELECTED_CURRENCY in this._settings) {
            return parseInt(this._settings[SettingsKeys.SELECTED_CURRENCY])
        }
        return Currency.EUR;
    }
    setSelectedCurrency(c: Currency) {
        if(!this._settings) {
            this._settings = {};
        }
        this.set(SettingsKeys.SELECTED_CURRENCY, c);
    }

    private load(): void {
        if (this.dataService.containsKey(this._KEY)) {
            let settings = this.dataService.get(this._KEY);
            this._settings = settings;
            // TODO: check differentce and emit changes
            // for now - emit change for every key
            for(let key in this._settings) {
                this.changed.emit(key);
            }
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