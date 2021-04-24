import * as Papa from 'papaparse';

import { Transaction } from 'src/app/models/transaction.model';

export abstract class TransactionParserBase {

    protected readonly papaDefaultConfig = {
        delimiter: "",	// auto-detect
        newline: "",	// auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: false,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: undefined,
        error: undefined,
        download: false,
        downloadRequestHeaders: undefined,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
    }

    protected readTransactions(input: File, encoding, postProcess: (x: string) => Transaction[]) {
        let fileReader = new FileReader();
        return new Promise<Transaction[]>((resolve, reject) => {
            fileReader.onerror = () => {
                fileReader.abort();
                reject();
            };
            fileReader.onload = () => {
                if (typeof (fileReader.result) !== "string") {
                    reject();
                }
                let result = postProcess(fileReader.result as string);
                resolve(result);
            };
            fileReader.readAsText(input, encoding);
        });
    }
}