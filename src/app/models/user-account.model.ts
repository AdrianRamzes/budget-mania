import { Currency } from './currency.enum';

export class UserAccount {
    guid: string;
    name: string;
    fullName: string;
    bankName: string;
    IBAN: string;
    currency: Currency;
}