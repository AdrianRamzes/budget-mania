import { DataService } from '../data/data.service';
import { Storage } from '../data/storage/storage.interface';
import { Currency } from '../models/currency.enum';
import { TransactionsAccount } from '../models/transactions-account.model';
import { AccountsRepository } from './accounts.repository';
import { TransactionsRepository } from './transactions.repository';

fdescribe('Account Repository', () => {

    const getAccountRepository = async (accounts: any = [], transactions: any = []) => {
        const dataService = new TestDataService(accounts, transactions);
        await dataService.load();
        return new AccountsRepository(dataService, new TransactionsRepository(dataService));
    };

    it('returns empty list if dataService is empty', async () => {
        const repository = await getAccountRepository();

        expect(repository.list().length).toBe(0);
    });

    it('returns empty list if dataService has empty list', async () => {
        const repository = await getAccountRepository([]);

        expect(repository.list().length).toBe(0);
    });

    it('returns accounts list if dataService is not empty', async () => {
        const repository = await getAccountRepository([
            new TransactionsAccount(),
        ]);

        expect(repository.list().length).toBe(1);
    });

    it('returns copy of trasactions list', async () => {
        const repository = await getAccountRepository([
            {
                bankName: 'original',
                currency: Currency.DKK
            } as TransactionsAccount,
        ]);
        const list = repository.list();

        list[0].bankName = 'modified!';
        list[0].currency = Currency.GBP;

        expect(repository.list()[0].bankName).toBe('original');
        expect(repository.list()[0].currency).toBe(Currency.DKK);
    });

    it('adds account to empty repository', async () => {
        const repository = await getAccountRepository();

        repository.add(new TransactionsAccount());

        expect(repository.list().length).toBe(1);
    });

    it('adds account to non empty repository', async () => {
        const repository = await getAccountRepository([new TransactionsAccount()]);

        repository.add(new TransactionsAccount());

        expect(repository.list().length).toBe(2);
    });

    it('adds account with correct values', async () => {
        const repository = await getAccountRepository();
        const account = new TransactionsAccount();
        account.IBAN = 'IBAN';
        account.bankName = 'bankName';
        account.currency = Currency.CZK;
        account.fullName = 'fullName';
        account.name = 'name';

        repository.add(account);
        const listResult = repository.list();
        const result = listResult[0];

        expect(result.IBAN).toBe('IBAN');
        expect(result.bankName).toBe('bankName');
        expect(result.currency).toBe(Currency.CZK);
        expect(result.fullName).toBe('fullName');
        expect(result.name).toBe('name');
    });

    it('"get" returns account if exists', async () => {
        const repository = await getAccountRepository([new TransactionsAccount('test-guid')]);

        const actual = repository.get('test-guid');

        expect(actual).not.toBeNull();
    });

    it('"get" returns null if account does not exist', async () => {
        const repository = await getAccountRepository([new TransactionsAccount('test-guid')]);

        const actual = repository.get('wrong-guid');

        expect(actual).toBeNull();
    });

    it('returns false when repository is empty', async () => {
        const repository = await getAccountRepository();

        expect(repository.contains('test-guid')).toBe(false);
    });

    it('returns true when account exists in repository', async () => {
        const repository = await getAccountRepository();
        repository.add(new TransactionsAccount('test-guid'));

        expect(repository.contains('test-guid')).toBe(true);
    });

    it('returns false when account does not exist in repository', async () => {
        const repository = await getAccountRepository();
        repository.add(new TransactionsAccount('test-guid'));

        expect(repository.contains('wrong-guid')).toBe(false);
    });

    it('edits account', async () => {
        let account = new TransactionsAccount();
        account.name = 'account-name';
        const repository = await getAccountRepository([account]);

        account = repository.get(account.guid);
        account.name = 'different-name';
        repository.edit(account);

        expect(repository.get(account.guid).name).toBe('different-name');
    });

    it('removes acount', async () => {
        const a1 = new TransactionsAccount();
        const a2 = new TransactionsAccount();
        const repository = await getAccountRepository([a1, a2]);
        expect(repository.list().length).toBe(2);

        repository.remove(a1.guid);

        expect(repository.list().length).toBe(1);
        expect(repository.contains(a1.guid)).toBeFalsy();
        expect(repository.contains(a2.guid)).toBeTruthy();
    });

    it('emits event when account is added', async () => {
        const repository = await getAccountRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.add(new TransactionsAccount());
        repository.add(new TransactionsAccount());

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when account is edited', async () => {
        const a1 = new TransactionsAccount();
        const a2 = new TransactionsAccount();
        a1.name = 'a1-name';
        a2.name = 'a2-name';
        const repository = await getAccountRepository([a1, a2]);
        a1.name = 'modified a1-name';
        a2.name = 'modified a1-name';
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.edit(a1);
        repository.edit(a2);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when account is removed', async () => {
        const a1 = new TransactionsAccount();
        const a2 = new TransactionsAccount();
        const repository = await getAccountRepository([a1, a2]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.remove(a1.guid);
        repository.remove(a2.guid);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('does not emit event when data is not changed', async () => {
        const a = new TransactionsAccount();
        const repository = await getAccountRepository([a]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.get(a.guid);
        repository.contains(a.guid);
        repository.list();

        expect(repository.changed.emit).not.toHaveBeenCalled();
    });

    it('calls dataService when suitable key was emitted', async () => {
        const a = new TransactionsAccount();
        const dataService = new TestDataService([a], []);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('accounts', []);

        expect(dataService.get).toHaveBeenCalledWith('accounts');
    });

    it('does not call dataService when not suitable key was emitted', async () => {
        const a = new TransactionsAccount();
        const dataService = new TestDataService([a], []);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('wrong', {});

        expect(dataService.get).not.toHaveBeenCalled();
    });

    it('does not call dataService when data is not changed', async () => {
        const a = new TransactionsAccount();
        const dataService = new TestDataService([a], []);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();
        spyOn(dataService, 'set').and.callThrough();

        repository.contains(a.guid);
        repository.get(a.guid);
        repository.list();

        expect(dataService.get).not.toHaveBeenCalled();
        expect(dataService.set).not.toHaveBeenCalled();
    });

    it('calls dataService when account is added', async () => {
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new AccountsRepository(dataService, new TransactionsRepository(dataService));
        spyOn(dataService, 'set').and.callThrough();

        repository.add(new TransactionsAccount());
        repository.add(new TransactionsAccount());

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when account is edited', async () => {
        const a1 = new TransactionsAccount();
        const a2 = new TransactionsAccount();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new AccountsRepository(dataService, new TransactionsRepository(dataService));
        spyOn(dataService, 'set').and.callThrough();

        a1.name = 'a1-name';
        a2.name = 'a2-name';
        repository.edit(a1);
        repository.edit(a2);

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when account is removed', async () => {
        const a1 = new TransactionsAccount();
        const a2 = new TransactionsAccount();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'set').and.callThrough();

        repository.remove(a1.guid);
        repository.remove(a2.guid);

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });
});

class TestDataService extends DataService {
    constructor(accounts: any = [], transactions: any = []) {
        const notNull = accounts != null || transactions != null;
        super(new TestStorage(async () => notNull ? JSON.stringify({
            accounts: accounts,
            transactions: transactions
        }) : ''), true);
    }

    emit(key: string, value: any) {
        super.set(key, value);
    }
}

class TestStorage implements Storage {

    constructor(
        get: () => Promise<string> = null,
        put: (data: string) => Promise<void> = null) {
        this.get = get;
        this.put = put;
    }
    get: () => Promise<string>;
    put: (data: string) => Promise<void>;
}
