import { DataService } from '../data/data.service';
import { Storage } from '../data/storage/storage.interface';
import { Transaction } from '../models/transaction.model';
import { TransactionsRepository } from './transactions.repository';

describe('Transactions Repository', () => {

    const getTransactionsRepository = (value: any = null) => {
        return new TransactionsRepository(new TestDataService(value));
    };

    it('returns empty list if dataService is empty', () => {
        const repository = getTransactionsRepository();

        expect(repository.list().length).toBe(0);
    });

    it('returns empty list if dataService has empty list', () => {
        const repository = getTransactionsRepository([] as Transaction[]);

        expect(repository.list().length).toBe(0);
    });
});

class TestDataService extends DataService {
    constructor(value: any = null) {
        super(new TestStorage(async () => value != null ? JSON.stringify({
            transactions: value
        }) : null));
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
