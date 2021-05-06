import * as moment from 'moment';
import { defer } from 'rxjs';
import { Currency } from '../models/currency.enum';
import { ExchangeRepository } from './exchange.repository';
import { Auth, Storage as S3 } from 'aws-amplify';
import { testconfig, testusers } from 'aws-exports-test';

describe('Exchange Repository', () => {

    function generateExchangerateapiResponse(date: Date) {
        const response = {
            'success': true,
            'timestamp': 1619128744,
            'base': 'EUR',
            'date': '2021-04-22',
            'rates': {
                'AED': 4.413845,
                'AFN': 93.277731,
                'ALL': 123.13726,
                'AMD': 627.571074,
                'ANG': 2.156482,
                'AOA': 788.807513,
                'ARS': 111.849659,
                'AUD': 1.560031,
                'AWG': 2.163346,
                'AZN': 2.049265,
                'BAM': 1.949571,
                'BBD': 2.425314,
                'BDT': 101.86957,
                'BGN': 1.958054,
                'BHD': 0.453116,
                'BIF': 2364.930057,
                'BMD': 1.201692,
                'BND': 1.595204,
                'BOB': 8.295442,
                'BRL': 6.542734,
                'BSD': 1.201244,
                'BTC': 0.000023290816,
                'BTN': 90.161701,
                'BWP': 12.978933,
                'BYN': 3.111499,
                'BYR': 23553.165201,
                'BZD': 2.421227,
                'CAD': 1.502717,
                'CDF': 2397.376313,
                'CHF': 1.10207,
                'CLF': 0.030782,
                'CLP': 849.354926,
                'CNY': 7.800425,
                'COP': 4368.571383,
                'CRC': 738.040603,
                'CUC': 1.201692,
                'CUP': 31.844841,
                'CVE': 110.431653,
                'CZK': 25.856855,
                'DJF': 213.564782,
                'DKK': 7.436434,
                'DOP': 68.418373,
                'DZD': 159.707318,
                'EGP': 18.867411,
                'ERN': 18.027678,
                'ETB': 50.206826,
                'EUR': 1,
                'FJD': 2.458482,
                'FKP': 0.872879,
                'GBP': 0.868282,
                'GEL': 4.14569,
                'GGP': 0.872879,
                'GHS': 6.951795,
                'GIP': 0.872879,
                'GMD': 61.409036,
                'GNF': 11938.810908,
                'GTQ': 9.269043,
                'GYD': 251.119335,
                'HKD': 9.325191,
                'HNL': 28.985092,
                'HRK': 7.573182,
                'HTG': 100.582092,
                'HUF': 364.021981,
                'IDR': 17489.006261,
                'ILS': 3.914836,
                'IMP': 0.872879,
                'INR': 90.234279,
                'IQD': 1756.273007,
                'IRR': 50597.245754,
                'ISK': 151.027986,
                'JEP': 0.872879,
                'JMD': 181.47639,
                'JOD': 0.851992,
                'JPY': 129.736484,
                'KES': 130.386697,
                'KGS': 101.907001,
                'KHR': 4871.660186,
                'KMF': 492.603647,
                'KPW': 1081.523123,
                'KRW': 1345.772329,
                'KWD': 0.362065,
                'KYD': 1.001086,
                'KZT': 519.522132,
                'LAK': 11323.544933,
                'LBP': 1836.185696,
                'LKR': 233.6652,
                'LRD': 207.297521,
                'LSL': 17.208452,
                'LTL': 3.548285,
                'LVL': 0.726891,
                'LYD': 5.38955,
                'MAD': 10.731717,
                'MDL': 21.600151,
                'MGA': 4506.345755,
                'MKD': 61.574628,
                'MMK': 1693.922187,
                'MNT': 3425.606456,
                'MOP': 9.602232,
                'MRO': 429.003874,
                'MUR': 48.608252,
                'MVR': 18.565927,
                'MWK': 949.336921,
                'MXN': 23.956691,
                'MYR': 4.941717,
                'MZN': 66.765718,
                'NAD': 17.208193,
                'NGN': 457.844423,
                'NIO': 42.166547,
                'NOK': 10.056517,
                'NPR': 144.258283,
                'NZD': 1.678103,
                'OMR': 0.462672,
                'PAB': 1.201244,
                'PEN': 4.514156,
                'PGK': 4.244976,
                'PHP': 58.274891,
                'PKR': 184.399854,
                'PLN': 4.561443,
                'PYG': 7747.024994,
                'QAR': 4.375336,
                'RON': 4.92718,
                'RSD': 117.173827,
                'RUB': 90.73495,
                'RWF': 1186.070105,
                'SAR': 4.506126,
                'SBD': 9.598278,
                'SCR': 16.727776,
                'SDG': 459.046187,
                'SEK': 10.150279,
                'SGD': 1.597373,
                'SHP': 0.872879,
                'SLL': 12263.268201,
                'SOS': 704.191504,
                'SRD': 17.008748,
                'STD': 24910.041455,
                'SVC': 10.511255,
                'SYP': 1511.208823,
                'SZL': 17.208151,
                'THB': 37.721437,
                'TJS': 13.69603,
                'TMT': 4.217939,
                'TND': 3.295637,
                'TOP': 2.72033,
                'TRY': 10.00321,
                'TTD': 8.15163,
                'TWD': 33.729063,
                'TZS': 2785.566705,
                'UAH': 33.700714,
                'UGX': 4335.082702,
                'USD': 1.201692,
                'UYU': 53.10004,
                'UZS': 12647.809918,
                'VEF': 256958089367.07623,
                'VND': 27725.440179,
                'VUV': 131.631987,
                'WST': 3.042356,
                'XAF': 653.950079,
                'XAG': 0.04595,
                'XAU': 0.000674,
                'XCD': 3.247633,
                'XDR': 0.838128,
                'XOF': 653.720705,
                'XPF': 119.869231,
                'YER': 300.963679,
                'ZAR': 17.208509,
                'ZMK': 10816.703471,
                'ZMW': 26.732578,
                'ZWL': 386.945091
            }
        };
        response.date = moment(date).format('YYYY-MM-DD');
        response.timestamp = moment(date).unix();
        return response;
    }

    beforeAll(async () => {
        Auth.configure(testconfig.Auth);
        S3.configure(testconfig.Storage);
        await Auth.signOut();
    });

    afterAll(async () => {
        await Auth.signOut();
    });

    beforeEach(async () => {
        localStorage.clear();
        await Auth.signIn(testusers.test2.username, testusers.test2.password);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('calls s3 when localStorage is empty (skipInitialLoading = false)', (done) => {
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ false);

        repository.changed.subscribe(() => {
            expect(repository.getRate(Currency.EUR, Currency.PLN)).not.toBe(4.561443);
            expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeGreaterThanOrEqual(4.1);
            expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeLessThanOrEqual(4.9);
            done();
        });
    });

    it('throws error when rates are no loaded', async () => {
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);

        expect(() => repository.getRate(Currency.EUR, Currency.PLN)).toThrowError();
    });

    it('calls s3 when localStorage is empty (skipInitialLoading = true)', async () => {
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);

        await repository.load();

        expect(repository.getRate(Currency.EUR, Currency.PLN)).not.toBe(4.561443);
        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeGreaterThanOrEqual(4.1);
        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeLessThanOrEqual(4.9);
    });

    it('reads from localStorage when present and not obsolete', async () => {
        localStorage.setItem('exchangerates', JSON.stringify(generateExchangerateapiResponse(moment().add(-23, 'hours').toDate())));
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);

        await repository.load();

        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBe(4.561443);
    });

    it('calls s3 when data in localStorage is present but is obsolete', async () => {
        localStorage.setItem('exchangerates', JSON.stringify(generateExchangerateapiResponse(moment().add(-25, 'hours').toDate())));
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);

        await repository.load();

        expect(repository.getRate(Currency.EUR, Currency.PLN)).not.toBe(4.561443);
        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeGreaterThanOrEqual(4.1);
        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBeLessThanOrEqual(4.9);
    });

    it('returns correct rates', async () => {
        localStorage.setItem('exchangerates', JSON.stringify(generateExchangerateapiResponse(new Date())));
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);
        await repository.load();

        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBe(4.561443);
        expect(repository.getRate(Currency.CHF, Currency.PLN)).toBeCloseTo(4.138977, 4);
    });

    it('returns correct rates', async () => {
        localStorage.setItem('exchangerates', JSON.stringify(generateExchangerateapiResponse(new Date())));
        const repository = new TestExchangeRepository(/*skipInitialLoading*/ true);
        await repository.load();

        expect(repository.getRate(Currency.EUR, Currency.PLN)).toBe(4.561443);
        expect(repository.getRate(Currency.PLN, Currency.EUR)).toBeCloseTo(0.219228, 4);
        expect(repository.getRate(Currency.CHF, Currency.PLN)).toBeCloseTo(4.138977, 4);
    });
});

class TestExchangeRepository extends ExchangeRepository {
    constructor(skipInitialLoading: boolean) {
        super(skipInitialLoading);
    }

    public load(): Promise<void> {
        return super.load();
    }
}
