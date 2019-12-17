import * as Papa from 'papaparse';
import * as moment from 'moment';

import { TransactionParser } from './transactionParser';
import { Transaction } from 'src/app/models/transaction.model';
import { TransactionParserBase } from './transactionParserBase';
import { Currency } from 'src/app/models/currency.enum';

export class SantanderBankPolskaParser extends TransactionParserBase implements TransactionParser {

    name = "Santander Bank Polska";

    private readonly config = {
        skipEmptyLines: true,
        encoding: 'utf-8',

        //skip lines (this is not part of papa config)
        skipFirstLines: 1
    };

    parse(input: File): Promise<Transaction[]> {

        if (!input.name.startsWith("historia_")) {
            return Promise.reject(`Not a file from ${this.name}`);
        }

        const getTransactions = (fileContent: string): Transaction[] => {
            let lines = fileContent.split(/\r?\n/);

            let firstLineParsed = Papa.parse(lines[0], this.config).data[0];
            let iban = firstLineParsed[2].replace("'", "");
            let currency = Currency[firstLineParsed[4] as string];

            let prepared = lines
                .slice(this.config.skipFirstLines)
                .join('\n');

            let result = Papa.parse(prepared, this.config);

            return result.data.map((t, i) => {
                return {
                    amount: Number.parseFloat(t[5].replace(',', '.')),
                    date: moment(t[0], "DD-MM-YYYY").toDate(),
                    title: t[2],
                    currency: currency,
                    IBAN: iban,
                } as Transaction;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }
}