import * as _ from "lodash";

import { EventEmitter, Injectable } from '@angular/core';
// import { BetterDataService } from '../betterdata.service';
import { HttpClient } from '@angular/common/http';
import { Currency } from 'src/app/models/currency.enum';

@Injectable({providedIn: 'root'})
export class ExchangeRepository {

    changed: EventEmitter<any> = new EventEmitter();

    private _exchange: any = null;

    constructor(private http: HttpClient) {
        this.load();
    }

    getRate(from: Currency, to: Currency): number {
        if(this._exchange) {
            if(this._exchange) {
                let fromEUR = from !== Currency.EUR ? this._exchange["rates"][Currency[from]] : 1;
                let toEUR = to !== Currency.EUR ? this._exchange["rates"][Currency[to]] : 1;
                return toEUR/fromEUR;
            }
        }
        return -1;
    }

    getRates(): any {
        return this._exchange;
    }

    private set(exchange: any) {
        this._exchange = exchange;
        this.changed.emit(exchange);
    }

    private load(): void {
        this.http.get("https://api.exchangeratesapi.io/latest").subscribe(
            (data) => {
                if(!!this._exchange || this._exchange.date < data["date"]) {
                    this.set(data);
                }
            },
            (error) => { console.log(error); }
        );
    }
}