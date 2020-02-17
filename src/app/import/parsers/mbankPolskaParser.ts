import * as Papa from 'papaparse';
import * as moment from 'moment';

import { TransactionParser } from './transactionParser';
import { Transaction } from 'src/app/models/transaction.model';
import { TransactionParserBase } from './transactionParserBase';
import { Currency } from 'src/app/models/currency.enum';

export class MBankPolskaParser extends TransactionParserBase implements TransactionParser {

    name = "mBank Polska";

    private readonly config = {
        skipEmptyLines: true,
        encoding: 'ISO-8859-2',
        //skip lines (this is not part of papa config)
        skipFirstLines: 38,
        skipLastLines: 5,
    };

    parse(input: File): Promise<Transaction[]> {

        if (!input.name.startsWith("eKonto_")) {
            return Promise.reject(`Not a file from ${this.name}`);
        }

        const getTransactions = (fileContent: string): Transaction[] => {
            let prepared = fileContent
                .split(/\r?\n/)
                .slice(this.config.skipFirstLines, -this.config.skipLastLines)
                .join('\n');

            let result = Papa.parse(prepared, this.config);

            return result.data.map((t, i) => {
                let trans = new Transaction();
                trans.amount = Number.parseFloat(t[6].replace(/\s/g, '').replace(',', '.'));
                trans.date = moment(t[0], "YYYY-MM-DD").toDate();
                trans.title = t[3];
                trans.currency = Currency.PLN;
                return trans;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }
}