import * as Papa from 'papaparse';
import * as moment from 'moment';

import { TransactionParser } from './transactionParser';
import { Transaction } from "src/app/models/transaction.model";
import { TransactionParserBase } from './transactionParserBase';
import { Currency } from 'src/app/models/currency.enum';

export class INGLuxembourgParser extends TransactionParserBase implements TransactionParser {

    name = "ING Luxembourg";

    private readonly config = {
        skipEmptyLines: true,
        encoding: 'utf-8',

        //skip lines (this is not part of papa config)
        skipFirstLines: 1
    };

    parse(input: File): Promise<Transaction[]> {

        if (!input.name.startsWith("export_LU")) {
            return Promise.reject(`Not a file from ${this.name}`);
        }

        const getTransactions = (fileContent: string): Transaction[] => {
            let rawLines = fileContent
                .split(/\r?\n/)
                .slice(this.config.skipFirstLines);

            let prepared = rawLines.join('\n');

            let result = Papa.parse(prepared, this.config);

            //console.log(result.data);

            return result.data.map((t, i) => {
                let trans = new Transaction();
                trans.amount = Number.parseFloat(t[6].replace(',', '.'));
                trans.date = moment(t[3], "DD/MM/YY").toDate();
                trans.title = t[2];
                trans.currency = Currency[t[7] as string] ;
                //trans.raw = rawLines[i];
                return trans;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }
}