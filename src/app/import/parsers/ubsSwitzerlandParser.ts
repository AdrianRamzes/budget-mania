import * as Papa from 'papaparse';
import * as moment from 'moment';

import { TransactionParser } from './transactionParser';
import { Transaction } from 'src/app/models/transaction.model';
import { TransactionParserBase } from './transactionParserBase';
import { Currency } from 'src/app/models/currency.enum';

// 0: "22.04.2021" // Valuation date
// 1: "0000 00000000" // Banking relationship;
// 2: "" // Portfolio;
// 3: "0000 00000000.00A" // Product;
// 4: "CH00 0000 0000 0000 00000 A" // IBAN;
// 5: "CHF" // Ccy.;
// 6: "27.04.2020" // Date from;
// 7: "23.04.2021" // Date to;
// 8: "UBS Personal Account" // Description;
// 9: "23.04.2021" // Trade date;
// 10: "23.04.2021" // Booking date;
// 11: "23.04.2021" // Value date;
// 12: "Payment UBS TWINT" // Description 1;
// 13: "SBB EasyRide App" // Description 2;
// 14: "- NA, 3000 BERN, TWINT-ACC.:+41788000000, 9906113GK3218208" // Description 3;
// 15: "9906113GK3218208" // Transaction no.;
// 16: "" // Exchange rate in the original amount in settlement currency;
// 17: "" // Individual amount;
// 18: "2.30" // Debit;
// 19: "" // Credit;
// 20: "1'001'.52" // Balance

export class UBSSwitzerlandParser extends TransactionParserBase implements TransactionParser {

    name = 'UBS Switzerland';

    private readonly config = {
        skipEmptyLines: true,
        encoding: 'utf-8',
        // skip lines (this is not part of papa config)
        skipFirstLines: 1,
        skipLastLines: 4,
    };

    parse(input: File): Promise<Transaction[]> {
        if (!input.name.startsWith('export ') && input.name !== 'export.csv') {
            return Promise.reject(`Not a file for ${this.name} parser.`);
        }
        const getTransactions = (fileContent: string): Transaction[] => {
            const prepared = fileContent
                .split(/\r?\n/)
                .slice(this.config.skipFirstLines, -this.config.skipLastLines)
                .join('\n');
            const result = Papa.parse(prepared, this.config);

            return result.data.map((t, i) => {
                const trans = new Transaction();
                trans.amount = this.getAmount(t[18], t[19]);
                trans.date = moment(t[10], 'DD.MM.YYYY').toDate();
                trans.valueDate = moment(t[11], 'DD.MM.YYYY').toDate();
                trans.information = ([t[12], t[13], t[14]] as string[]).filter(e => e.length > 0).join(' | ');
                trans.reference = t[15];
                trans.currency = Currency.CHF;
                return trans;
            });
        };

        return this.readTransactions(input, this.config.encoding, getTransactions);
    }

    private getAmount(debit: string, credit: string): number {
        let amountStr = '0';
        if (debit.length > 0) {
            amountStr = debit.replace('\'', '');
            amountStr = `-${amountStr}`;
        } else if (credit.length > 0) {
            amountStr = credit.replace('\'', '');
        }

        return Number.parseFloat(amountStr);
    }
}
