import { DataService } from '../data/data.service';
import { Storage } from '../data/storage/storage.interface';
import { Currency } from '../models/currency.enum';
import { Transaction } from '../models/transaction.model';
import { TransactionsRepository } from './transactions.repository';

describe('Transactions Repository', () => {

    const getTransactionsRepository = async (value: any = null) => {
        const dataService = new TestDataService(value);
        await dataService.load();
        return new TransactionsRepository(dataService);
    };

    it('returns empty list if dataService is empty', async () => {
        const repository = await getTransactionsRepository();

        expect(repository.list().length).toBe(0);
    });

    it('returns empty list if dataService has empty list', async () => {
        const repository = await getTransactionsRepository([]);

        expect(repository.list().length).toBe(0);
    });

    it('returns transactions list if dataService is not empty', async () => {
        const repository = await getTransactionsRepository([
            new Transaction(),
        ]);

        expect(repository.list().length).toBe(1);
    });

    it('returns copy of trasactions list', async () => {
        const repository = await getTransactionsRepository([
            {
                information: 'original',
                amount: 666.66,
            } as Transaction,
        ]);
        const list = repository.list();

        list[0].information = 'modified!';
        list[0].amount = 555.555;

        expect(repository.list()[0].information).toBe('original');
        expect(repository.list()[0].amount).toBe(666.66);
    });

    it('adds single transaction to empty repository', async () => {
        const repository = await getTransactionsRepository();

        repository.add(new Transaction());

        expect(repository.list().length).toBe(1);
    });

    it('adds single transaction to non empty repository', async () => {
        const repository = await getTransactionsRepository([new Transaction()]);

        repository.add(new Transaction());

        expect(repository.list().length).toBe(2);
    });

    it('adds single transaction with correct values', async () => {
        const repository = await getTransactionsRepository();
        const transaction = new Transaction();
        transaction.amount = 124.45;
        transaction.beneficiaryDetails = 'beneficiaryDetails';
        transaction.beneficiaryName = 'beneficiaryName';
        transaction.categoryGuid = 'categoryGuid';
        transaction.currency = Currency.CZK;
        transaction.date = new Date(2021, 1, 20);
        transaction.destinationIBAN = 'destinationIBAN';
        transaction.identifier = 'identifier';
        transaction.importDate = new Date(2021, 1, 20);
        transaction.importGuid = 'importGuid';
        transaction.information = 'information';
        transaction.reference = 'reference';
        transaction.sourceIBAN = 'sourceIBAN';
        transaction.valueDate = new Date(2021, 1, 20);
        transaction.IBAN = 'IBAN';
        transaction.accountGuid = 'accountGuid';
        transaction.addressLine = 'addressLine';

        repository.add(transaction);
        const listResult = repository.list();
        const result = listResult[0];

        expect(result.amount).toBe(124.45);
        expect(result.beneficiaryDetails).toBe('beneficiaryDetails');
        expect(result.beneficiaryName).toBe('beneficiaryName');
        expect(result.categoryGuid).toBe('categoryGuid');
        expect(result.currency).toEqual(Currency.CZK);
        expect(result.date).toEqual(new Date(2021, 1, 20));
        expect(result.destinationIBAN).toBe('destinationIBAN');
        expect(result.identifier).toBe('identifier');
        expect(result.importDate).toEqual(new Date(2021, 1, 20));
        expect(result.importGuid).toBe('importGuid');
        expect(result.information).toBe('information');
        expect(result.reference).toBe('reference');
        expect(result.sourceIBAN).toBe('sourceIBAN');
        expect(result.valueDate).toEqual(new Date(2021, 1, 20));
        expect(result.IBAN).toBe('IBAN');
        expect(result.accountGuid).toBe('accountGuid');
        expect(result.addressLine).toBe('addressLine');
    });

    it('"get" returns single transaction if exists', async () => {
        const repository = await getTransactionsRepository([new Transaction('test-guid')]);

        const actual = repository.get('test-guid');

        expect(actual).not.toBeNull();
    });

    it('"get" returns null if transaction does not exist', async () => {
        const repository = await getTransactionsRepository([new Transaction('test-guid')]);

        const actual = repository.get('wrong-guid');

        expect(actual).toBeNull();
    });

    it('adds multiple transaction to empty repository', async () => {
        const repository = await getTransactionsRepository();

        repository.addMany([new Transaction(), new Transaction()]);

        expect(repository.list().length).toBe(2);
    });

    it('adds multiple transaction to non empty repository', async () => {
        const repository = await getTransactionsRepository([new Transaction()]);

        repository.addMany([new Transaction(), new Transaction()]);

        expect(repository.list().length).toBe(3);
    });

    it('returns false when repository is empty', async () => {
        const repository = await getTransactionsRepository();

        expect(repository.contains('test-guid')).toBe(false);
    });

    it('returns true when transaction exists in repository', async () => {
        const repository = await getTransactionsRepository();
        repository.add(new Transaction('test-guid'));

        expect(repository.contains('test-guid')).toBe(true);
    });

    it('returns false when transaction does not exist in repository', async () => {
        const repository = await getTransactionsRepository();
        repository.add(new Transaction('test-guid'));

        expect(repository.contains('wrong-guid')).toBe(false);
    });

    it('edits single transaction', async () => {
        let transaction = new Transaction();
        transaction.amount = 123.45;
        const repository = await getTransactionsRepository([transaction]);

        transaction = repository.get(transaction.guid);
        transaction.amount = 67.89;
        repository.edit(transaction);

        expect(repository.get(transaction.guid).amount).toBe(67.89);
    });

    it('edits multiple transactions', async () => {
        const transaction1 = new Transaction();
        const transaction2 = new Transaction();
        transaction1.amount = 123.45;
        transaction2.amount = 67.89;
        const repository = await getTransactionsRepository([transaction1, transaction2]);

        transaction1.amount *= 10;
        transaction2.amount *= 10;
        repository.editMany([transaction2, transaction1]);

        const actual = repository.list();
        expect(actual[0].amount).toBe(1234.5);
        expect(actual[1].amount).toBe(678.9);
    });

    it('removes single transaction', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const repository = await getTransactionsRepository([t1, t2]);
        expect(repository.list().length).toBe(2);

        repository.remove(t1.guid);

        expect(repository.list().length).toBe(1);
        expect(repository.contains(t1.guid)).toBeFalsy();
        expect(repository.contains(t2.guid)).toBeTruthy();
    });

    it('removes multiple transactions', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const repository = await getTransactionsRepository([t1, t2]);
        expect(repository.list().length).toBe(2);

        repository.removeMany([t1.guid, t2.guid]);

        expect(repository.list().length).toBe(0);
    });

    it('emits event when single transaction is added', async () => {
        const repository = await getTransactionsRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.add(new Transaction());
        repository.add(new Transaction());

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when multiple transactions are added', async () => {
        const repository = await getTransactionsRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.addMany([new Transaction(), new Transaction()]);

        expect(repository.changed.emit).toHaveBeenCalledTimes(1);
    });

    it('emits event when single transaction is edited', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        t1.amount = 123.45;
        t2.amount = 67.89;
        const repository = await getTransactionsRepository([t1, t2]);
        t1.amount *= 10;
        t2.amount *= 10;
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.edit(t1);
        repository.edit(t2);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when multiple transactions are edited', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        t1.amount = 123.45;
        t2.amount = 67.89;
        const repository = await getTransactionsRepository([t1, t2]);
        t1.amount *= 10;
        t2.amount *= 10;
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.editMany([t2, t1]);

        expect(repository.changed.emit).toHaveBeenCalledTimes(1);
    });

    it('emits event when single transaction is removed', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const repository = await getTransactionsRepository([t1, t2]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.remove(t1.guid);
        repository.remove(t2.guid);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when multiple transactions are removed', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const repository = await getTransactionsRepository([t1, t2]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.removeMany([t1.guid, t2.guid]);

        expect(repository.changed.emit).toHaveBeenCalledTimes(1);
    });

    it('does not emit event when data is not changed', async () => {
        const t = new Transaction();
        const repository = await getTransactionsRepository([t]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.get(t.guid);
        repository.contains(t.guid);
        repository.list();

        expect(repository.changed.emit).not.toHaveBeenCalled();
    });

    // TODO: add tests for dataService calls.
    it('calls dataService when suitable key was emitted', async () => {
        const t = new Transaction();
        const dataService = new TestDataService([t]);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('transactions', []);

        expect(dataService.get).toHaveBeenCalledWith('transactions');
    });

    it('does not call dataService when not suitable key was emitted', async () => {
        const t = new Transaction();
        const dataService = new TestDataService([t]);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('wrong', {});

        expect(dataService.get).not.toHaveBeenCalled();
    });

    it('does not call dataService when data is not changed', async () => {
        const t = new Transaction();
        const dataService = new TestDataService([t]);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();
        spyOn(dataService, 'set').and.callThrough();

        repository.contains(t.guid);
        repository.get(t.guid);
        repository.list();

        expect(dataService.get).not.toHaveBeenCalled();
        expect(dataService.set).not.toHaveBeenCalled();
    });

    it('calls dataService when single transaction is added', async () => {
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        repository.add(new Transaction());
        repository.add(new Transaction());

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when multiple transactions are added', async () => {
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        repository.addMany([new Transaction(), new Transaction()]);

        expect(dataService.set).toHaveBeenCalledTimes(1);
    });

    it('calls dataService when single transaction is edited', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        t1.amount = 123.45;
        t2.amount = 67.89;
        repository.edit(t1);
        repository.edit(t2);

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when multiple transactions are edited', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        t1.amount = 123.45;
        t2.amount = 67.89;
        repository.editMany([t1, t2]);

        expect(dataService.set).toHaveBeenCalledTimes(1);
    });

    it('calls dataService when single transaction is removed', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        repository.remove(t1.guid);
        repository.remove(t2.guid);

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when multiple transactions are removed', async () => {
        const t1 = new Transaction();
        const t2 = new Transaction();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        repository.removeMany([t1.guid, t2.guid]);

        expect(dataService.set).toHaveBeenCalledTimes(1);
    });
});

class TestDataService extends DataService {
    constructor(value: any = null) {
        super(new TestStorage(async () => value != null ? JSON.stringify({
            transactions: value
        }) : ''), true);
    }

    emit(key: string, value: any) {
        super.set(key, value);
    }
}

class TestStorage implements Storage{

    constructor(
            get: () => Promise<string> = null,
            put: (data: string) => Promise<void> = null) {
        this.get = get;
        this.put = put;
    }
    get: () => Promise<string>;
    put: (data: string) => Promise<void>;
}
