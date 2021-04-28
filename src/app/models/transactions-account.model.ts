import { Currency } from './currency.enum';
import { Guid } from 'guid-typescript';

export class TransactionsAccount {
    readonly guid: string;
    name: string;
    fullName: string;
    bankName: string;
    IBAN: string;
    currency: Currency;

    constructor(guid: string = null) {
        this.guid = guid != null
            ? Object.freeze(guid)
            : Object.freeze(Guid.create().toString());
    }
}
