import * as _ from 'lodash';

import { Currency } from 'src/app/models/currency.enum';
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { accessKeys } from 'access-keys';
import * as moment from 'moment';
import { DataService } from '../data/data.service';

@Injectable({providedIn: 'root'})
export class ExchangeRepository {

    constructor(private http: HttpClient, private dataService: DataService) {
        this.load();
    }

    private readonly _KEY = 'exchangeratesapi';

    /** Cache TTL in days */
    private readonly ttl = 7;

    changed: EventEmitter<any> = new EventEmitter();

    private rates: any = null;

    getRate(from: Currency, to: Currency): number {
        if (this.rates) {
            const fromEUR = from !== Currency.EUR ? this.rates[Currency[from]] : 1;
            const toEUR = to !== Currency.EUR ? this.rates[Currency[to]] : 1;
            return toEUR / fromEUR;
        }
        return -1;
    }

    private set(rates: any) {
        this.rates = rates;
        this.changed.emit(rates);
    }

    /** Gets data from localStorage, dataService, exchange rates provider. */
    private async load(): Promise<void> {
        // TODO: Get rid off localStorage (or use localstorage in dataService)
        const data = JSON.parse(localStorage.getItem(this._KEY));
        if (data != null
            && data.date != null
            && moment(data.date) < moment(data.date).add(this.ttl, 'days')
            && data.rates != null) {
            console.log('reading from cache');
            this.set(data.rates);
            return;
        }
        if (this.dataService.containsKey(this._KEY)) {
            console.warn('readging from dataService');
            const result = this.dataService.get(this._KEY) as any;
            if (moment(result.date) < moment(result.date).add(7, 'days')) {
                this.rates = result.rates;
                return;
            }
        }
        console.warn('quering https://api.exchangeratesapi.io');
        try {
            const result =
                await this.http.get(`http://api.exchangeratesapi.io/latest?access_key=${accessKeys.exchange}&base=EUR`)
                    .toPromise() as any;
            if (result != null) {
                if ((result as any)?.success === true) {
                    this.set((result as any).rates);
                    localStorage.setItem(this._KEY, JSON.stringify(result));
                    this.dataService.set(this._KEY, result);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
