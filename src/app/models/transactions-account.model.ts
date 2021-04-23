import { Currency } from './currency.enum';
import { Guid } from 'guid-typescript';

export class TransactionsAccount {
    guid: string;
    name: string;
    fullName: string;
    bankName: string;
    IBAN: string;
    currency: Currency;

    constructor() {
        this.guid = Object.freeze(Guid.create().toString());
    }
}
