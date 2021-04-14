import { Currency } from './currency.enum';
import { Guid } from 'guid-typescript';

//TODO: change name and make sure that contains all necessary fields
export class UserAccount {
    guid: string;
    name: string;
    fullName: string;
    bankName: string;
    IBAN: string;
    currency: Currency;

    constructor() {
        this.guid = Guid.create().toString();
    }
}