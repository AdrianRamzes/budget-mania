import { Currency } from './currency.enum';
import { Guid } from 'guid-typescript';

// TODO: Transaction Model - make sure that contains all the necessary  fields
export class Transaction {
    guid: string;
    transactionIdentifier: string; // some banks assign unique identifier to each transaction within bank
    title: string;
    date: Date;
    valueDate: Date;
    accountingDate: Date;
    amount: number;
    currency: Currency;
    IBAN: string = null;
    sourceIBAN: string = null;
    destinationIBAN: string = null;
    importDate: Date;
    importGuid: string = null;
    beneficiaryName: string = null;

    categoryGuid: string = null;
    accountGuid: string = null;

    constructor() {
        this.guid = Guid.create().toString();
    }

    // TODO: equals with guid
    static equals(t1: Transaction, t2: Transaction): boolean {

        if ( t1.IBAN != null && t2.IBAN != null
            && t1.IBAN === t2.IBAN
            && t1.transactionIdentifier != null && t2.transactionIdentifier != null
            && t1.transactionIdentifier === t2.transactionIdentifier) {
            return true;
        }

        return t1.title === t2.title &&
            t1.date.getTime() === t2.date.getTime() &&
            t1.amount === t2.amount &&
            t1.currency === t2.currency;
    }

    static getSimilarity(t1: Transaction, t2: Transaction): number {
        return this.equals(t1, t2) ? 1 : 0;
    }

    equals(t: Transaction): boolean{
        return Transaction.equals(this, t);
    }
}
