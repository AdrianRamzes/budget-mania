import { Currency } from './currency.enum';

export class UserAccount {
    name: string;
    fullName: string;
    bankName: string;
    IBAN: string;
    currency: Currency;
}