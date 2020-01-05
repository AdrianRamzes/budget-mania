import { Currency } from "./currency.enum";

export class Transaction {
    guid: string;
    title: string;
    date: Date;
    amount: number;
    currency: Currency;
    categoryName: string;
    IBAN: string;

    //TODO: equals with guid
    static equals(t1: Transaction, t2: Transaction): boolean {
        return t1.title === t2.title &&
            t1.date.getTime() === t2.date.getTime() &&
            t1.amount === t2.amount &&
            t1.currency === t2.currency;
    }

    equals(t: Transaction): boolean{
        return Transaction.equals(this, t);
    }
}