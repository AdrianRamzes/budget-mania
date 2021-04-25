import { UBSSwitzerlandParser } from './ubsSwitzerlandParser';
import { Transaction } from 'src/app/models/transaction.model';
import { Currency } from 'src/app/models/currency.enum';

describe('UBS Switzerland CSV parser', () => {

    let parser: UBSSwitzerlandParser;
    let mockCsv: File;

    beforeAll(() => {
        const content = require('./test-data/ubsSwitzerlandTestData1.js');
        mockCsv = new File([content], 'export (1)', { type: 'text/csv' });
    });

    beforeEach(() => {
        parser = new UBSSwitzerlandParser();
    });

    it('Smoke test', (done) => {
        parser.parse(mockCsv)
            .then((result: Transaction[]) => {
                expect(result.length).toBe(4);
                expect(result[0].currency).toBe(Currency.CHF);
                expect(result[0].amount).toBe(-2.3);
                expect(result[0].date).toEqual(new Date(2021, 3, 23));
                expect(result[0].valueDate).toEqual(new Date(2021, 3, 23));
                expect(result[0].information).toEqual('Payment UBS TWINT | SBB EasyRide App | - NA, 3000 BERN, TWINT-ACC.:+41788000000, 9906113GK3218208');
                expect(result[2].amount).toEqual(0);
                expect(result[3].amount).toEqual(1001.65);
                done();
            });
    });
});
