import * as Papa from 'papaparse';
import * as moment from 'moment';

import { TransactionParser } from './transactionParser';
import { Transaction } from "src/app/models/transaction.model";
import { TransactionParserBase } from './transactionParserBase';
import { Currency } from 'src/app/models/currency.enum';

export class RevolutParser extends TransactionParserBase implements TransactionParser {

    name = "Revolut";

    private readonly config = {
        skipEmptyLines: true,
        encoding: 'utf-8',

        //skip lines (this is not part of papa config)
        skipFirstLines: 1
    };

    parse(input: File): Promise<Transaction[]> {

        if (!input.name.startsWith("Revolut-")) {
            return Promise.reject(`Not a file from ${this.name}`);
        }

        let currencyRegExp = new RegExp('^Revolut\-([A-Z]{3})\-');
        let currencyStr = currencyRegExp.test(input.name) ? currencyRegExp.exec(input.name)[1] : null ;
        let currency = Currency[currencyStr] as Currency;

        const getTransactions = (fileContent: string): Transaction[] => {
            let rawLines = fileContent
                .split(/\r?\n/)
                .slice(this.config.skipFirstLines);

            let prepared = rawLines.join('\n');

            let result = Papa.parse(prepared, this.config);

            return result.data.map((t, i) => {
                let trans = new Transaction();
                trans.amount = (t[3] ? Number.parseFloat(t[3].replace(/\s/g, '').replace(',', '.')) : 0) - (t[2] ? Number.parseFloat(t[2].replace(/\s/g, '').replace(',', '.')) : 0);
                trans.date = this.parseRevolutDate(t[0]);
                trans.information = t[1];
                trans.currency = currency;
                return trans;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }

    private parseRevolutDate(revolutGarbageData: string): Date {
        // Lazy motherfu***** from revolut don't know how to do csv exports.
        // https://community.revolut.com/t/statement-export-csv-date-formatting/75661

        return moment(revolutGarbageData, "DD MMMM YYYY", "pl").toDate();
    }
}