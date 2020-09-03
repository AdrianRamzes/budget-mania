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

            return result.data.map((t, i) => {
                let trans = new Transaction();
                trans.transactionIdentifier = t[1];
                trans.date = moment(t[3], "DD/MM/YY").toDate();
                trans.valueDate = moment(t[4], "DD/MM/YY").toDate();
                trans.accountingDate = moment(t[5], "DD/MM/YY").toDate();
                trans.amount = Number.parseFloat(t[6].replace(/\s/g, '').replace(',', '.'));
                trans.currency = Currency[t[7] as string];
                trans.beneficiaryName = t[8];
                trans.destinationIBAN = t[9];
                if(t[10] != null && t[10].length > 0) {
                    trans.title = `${t[10]} [${t[2]}]`;
                } else {
                    trans.title = `[${t[2]}]`;
                }
                return trans;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }
}