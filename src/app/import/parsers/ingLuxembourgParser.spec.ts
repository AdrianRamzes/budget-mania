import { INGLuxembourgParser } from "./ingLuxembourgParser";
import { Transaction } from 'src/app/models/transaction.model';
import { Currency } from 'src/app/models/currency.enum';

describe("ING Luxembourg CSV parser", () => {

    let parser: INGLuxembourgParser;
    let mock_csv: File;

    beforeAll(() => {
        let content = require("./test-data/ingLuxemborugTestData1.js");
        mock_csv = new File([content], 'export_LU123', { type: 'text/csv' });
    })

    beforeEach(() => {
        parser = new INGLuxembourgParser();
    })

    it("Smoke test", (done) => {
        parser.parse(mock_csv)
            .then((result: Transaction[]) => {
                expect(result.length).toBe(4);
                expect(result[0].currency).toBe(Currency.EUR);
                expect(result[0].amount).toBe(6666.66);
                expect(result[0].date).toEqual(new Date(2019, 3, 29));
                expect(result[0].valueDate).toEqual(new Date(2019, 3, 29));
                // expect(result[0].accountingDate).toEqual(new Date(2019, 3, 29));
                expect(result[0].beneficiaryName).toEqual("XXX LUXEMBOURG SA XXX EU");
                expect(result[0].destinationIBAN).toEqual("LU111111111111111111");
                expect(result[0].inforamtion).toEqual("SALAIRE DU MOIS AVRIL 2019 [European Transfer XXX LUXEMBOURG SA XXX EU SALAIRE DU MOIS AVRIL 2019]");
                expect(result[0].identifier).toEqual("P00T0R000Z");
                done();
            });
    })
});