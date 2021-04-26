import { Currency } from './currency.enum';
import { Guid } from 'guid-typescript';

// TODO: Finish the Transaction model design
// TODO: make the transaction objects immutable

/** Transaction Model
 *
 * Based on Open Banking documentation:
 * https://openbanking.atlassian.net/wiki/spaces/DZ/pages/5785171/Account+and+Transaction+API+Specification+-+v1.1.0
 */
export class Transaction {
    readonly guid: string;

    /** Unique identifier for the transaction within an servicing institution.
     * This identifier is both unique and immutable.
     */
    identifier: string;

    /** Unique reference for the transaction. This reference is optionally populated,
     * and may as an example be the FPID in the Faster Payments context.
     */
    reference: string;

    /** [BookingDateTime] Date and time when a transaction entry is posted to an account on the account servicer's books.
     *
     * Usage: Booking date is the expected booking date, unless the status is booked,
     * in which case it is the actual booking date.
     */
    date: Date;

    /** Date and time at which assets become available to the account owner in case of a credit entry,
     * or cease to be available to the account owner in case of a debit transaction entry.
     *
     * Usage: If transaction entry status is pending and value date is present,
     * then the value date refers to an expected/requested value date.
     * For transaction entries subject to availability/float and for which availability information is provided,
     * the value date must not be used. In this case the availability component identifies the number of availability days.
     */
    valueDate: Date;

    /** Further details of the transaction.
     *
     * This is the transaction narrative, which is unstructured text.
     */
    information: string;

    /** Information that locates and identifies a specific address for a transaction entry,
     * that is presented in free format text.
     */
    addressLine: string;

    /** Amount of money in the cash transaction entry. */
    amount: number;

    /** Codes for the representation of currencies and funds.
     *
     * A code allocated to a currency by a Maintenance Agency under an international identification scheme,
     * as described in the latest edition of the international standard ISO 4217.
     */
    currency: Currency;

    // Name by which the merchant is known.
    // merchantName: string;

    // Details of the merchant involved in the transaction.
    // merchantDetails: string;

    // Additional fields:

    IBAN: string = null;
    sourceIBAN: string = null;
    destinationIBAN: string = null;

    /** Name by which the merchant is known.
     *
     * This field is used insead of MerchantName/CreditorName.
     */
    beneficiaryName: string;

    /** Details of the beneficiary involved in the transaction.
     *
     * This field is used insead of MerchantDetails/CreditorDetails.
     */
    beneficiaryDetails: string;

    /** The date of import to BudgetMania. */
    importDate: Date;

    /** BudgetMania import activity identifier.
     *
     * This is an internal field to identify all transactions imported by single action;
     */
    importGuid: string = null;

    categoryGuid: string = null;
    accountGuid: string = null;

    constructor(guid: string = null) {
        this.guid = guid != null
            ? Object.freeze(guid)
            : Object.freeze(Guid.create().toString());
    }

    // TODO: equals with guid
    static equals(t1: Transaction, t2: Transaction): boolean {
        if ( t1.IBAN != null && t2.IBAN != null
            && t1.IBAN === t2.IBAN
            && t1.identifier != null && t2.identifier != null
            && t1.identifier === t2.identifier) {
            return true;
        }

        return t1.information === t2.information &&
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
