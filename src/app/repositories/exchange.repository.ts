import * as _ from 'lodash';

import { Currency } from 'src/app/models/currency.enum';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Storage as S3 } from 'aws-amplify';
import * as moment from 'moment';

@Injectable({providedIn: 'root'})
export class ExchangeRepository {

    constructor(
        @Inject('skipInitialLoading') skipInitialLoading: boolean = false) {
        if (!skipInitialLoading) {
            this.load();
        }
    }

    private static readonly _KEY = 'exchangerates';

    /** Cache TTL in hours */
    private readonly ttl = 24;

    changed: EventEmitter<void> = new EventEmitter();

    private rates: any = null;

    getRate(from: Currency, to: Currency): number {
        if (this.rates) {
            const fromEUR = from !== Currency.EUR ? this.rates[Currency[from]] : 1;
            const toEUR = to !== Currency.EUR ? this.rates[Currency[to]] : 1;
            return toEUR / fromEUR;
        }
        throw new Error('Exchange rates are not available.');
    }

    private set(rates: any) {
        this.rates = rates;
        this.changed.emit();
    }

    /** Gets data from localStorage, dataService, exchange rates provider. */
    protected async load(): Promise<void> {
        // TODO: Get rid off localStorage (or use localstorage in dataService)
        const localData = JSON.parse(localStorage.getItem(ExchangeRepository._KEY));
        if (localData?.timestamp != null
            && moment().add(-this.ttl, 'hours') < moment.unix(localData.timestamp)
            && localData.rates != null) {
            this.set(localData.rates);
            return;
        }
        console.warn('quering s3');
        try {
            const s3Data = await S3.get(
                'exchange-rate.json',
                {
                    bucket: 'budget-mania-exchange-rate',
                    customPrefix: {
                        public: '',
                        protected: '',
                        private: ''
                    },
                    level: 'public',
                    cacheControl: 'no-cache',
                    download: true,
                }
            );
            const result = JSON.parse(await this.readFile(s3Data));
            if ((result as any).success === true) {
                this.set((result as any).rates);
                localStorage.setItem(ExchangeRepository._KEY, JSON.stringify(result));
            }
        } catch (error) {
            console.error(error);
            if (localData?.rates != null) {
                console.warn(`falling back to localStorage from ${localData.date}`);
                this.set(localData.rates);
            }
        }
    }

    private readFile(data): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                const result = fr.result as string;
                resolve(result);
            };
            fr.onerror = reject;
            fr.readAsText((data as any).Body as Blob);
        });
    }
}
