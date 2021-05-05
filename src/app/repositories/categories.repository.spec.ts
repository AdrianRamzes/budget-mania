import { DataService } from '../data/data.service';
import { Storage } from '../data/storage/storage.interface';
import { Category } from '../models/category.model';
import { CategoriesRepository } from './categories.repository';
import { TransactionsRepository } from './transactions.repository';

describe('Category Repository', () => {

    const getCategoryRepository = async (categories: any = [], transactions: any = []) => {
        const dataService = new TestDataService(categories, transactions);
        await dataService.load();
        return new CategoriesRepository(dataService, new TransactionsRepository(dataService));
    };

    it('returns empty list if dataService is empty', async () => {
        const repository = await getCategoryRepository();

        expect(repository.list().length).toBe(0);
    });

    it('returns empty list if dataService has empty list', async () => {
        const repository = await getCategoryRepository([]);

        expect(repository.list().length).toBe(0);
    });

    it('returns categories list if dataService is not empty', async () => {
        const repository = await getCategoryRepository([
            new Category(),
        ]);

        expect(repository.list().length).toBe(1);
    });

    it('returns copy of trasactions list', async () => {
        const repository = await getCategoryRepository([
            {
                name: 'original',
            } as Category,
        ]);
        const list = repository.list();

        list[0].name = 'modified!';

        expect(repository.list()[0].name).toBe('original');
    });

    it('adds category to empty repository', async () => {
        const repository = await getCategoryRepository();

        repository.add(new Category());

        expect(repository.list().length).toBe(1);
    });

    it('adds category to non empty repository', async () => {
        const repository = await getCategoryRepository([new Category()]);

        repository.add(new Category());

        expect(repository.list().length).toBe(2);
    });

    it('adds category with correct values', async () => {
        const repository = await getCategoryRepository();
        const category = new Category();
        category.name = 'name';

        repository.add(category);
        const listResult = repository.list();
        const result = listResult[0];

        expect(result.name).toBe('name');
    });

    it('"get" returns category if exists', async () => {
        const repository = await getCategoryRepository([new Category('test-guid')]);

        const actual = repository.get('test-guid');

        expect(actual).not.toBeNull();
    });

    it('"get" returns null if category does not exist', async () => {
        const repository = await getCategoryRepository([new Category('test-guid')]);

        const actual = repository.get('wrong-guid');

        expect(actual).toBeNull();
    });

    it('returns false when repository is empty', async () => {
        const repository = await getCategoryRepository();

        expect(repository.contains('test-guid')).toBe(false);
    });

    it('returns true when category exists in repository', async () => {
        const repository = await getCategoryRepository();
        repository.add(new Category('test-guid'));

        expect(repository.contains('test-guid')).toBe(true);
    });

    it('returns false when category does not exist in repository', async () => {
        const repository = await getCategoryRepository();
        repository.add(new Category('test-guid'));

        expect(repository.contains('wrong-guid')).toBe(false);
    });

    it('edits category', async () => {
        let category = new Category();
        category.name = 'category-name';
        const repository = await getCategoryRepository([category]);

        category = repository.get(category.guid);
        category.name = 'different-name';
        repository.edit(category);

        expect(repository.get(category.guid).name).toBe('different-name');
    });

    it('removes acount', async () => {
        const a1 = new Category();
        const a2 = new Category();
        const repository = await getCategoryRepository([a1, a2]);
        expect(repository.list().length).toBe(2);

        repository.remove(a1.guid);

        expect(repository.list().length).toBe(1);
        expect(repository.contains(a1.guid)).toBeFalsy();
        expect(repository.contains(a2.guid)).toBeTruthy();
    });

    it('emits event when category is added', async () => {
        const repository = await getCategoryRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.add(new Category());
        repository.add(new Category());

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when category is edited', async () => {
        const a1 = new Category();
        const a2 = new Category();
        a1.name = 'a1-name';
        a2.name = 'a2-name';
        const repository = await getCategoryRepository([a1, a2]);
        a1.name = 'modified a1-name';
        a2.name = 'modified a1-name';
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.edit(a1);
        repository.edit(a2);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('emits event when category is removed', async () => {
        const a1 = new Category();
        const a2 = new Category();
        const repository = await getCategoryRepository([a1, a2]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.remove(a1.guid);
        repository.remove(a2.guid);

        expect(repository.changed.emit).toHaveBeenCalledTimes(2);
    });

    it('does not emit event when data is not changed', async () => {
        const a = new Category();
        const repository = await getCategoryRepository([a]);
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.get(a.guid);
        repository.contains(a.guid);
        repository.list();

        expect(repository.changed.emit).not.toHaveBeenCalled();
    });

    it('calls dataService when suitable key was emitted', async () => {
        const a = new Category();
        const dataService = new TestDataService([a], []);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('categories', []);

        expect(dataService.get).toHaveBeenCalledWith('categories');
    });

    it('does not call dataService when not suitable key was emitted', async () => {
        const a = new Category();
        const dataService = new TestDataService([a], []);
        await dataService.load();
        const repository = new TransactionsRepository(dataService);
        spyOn(dataService, 'get').and.callThrough();

        dataService.emit('wrong', {});

        expect(dataService.get).not.toHaveBeenCalled();
    });

    it('does not call dataService when data is not changed', async () => {
        const a = new Category();
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

    it('calls dataService when category is added', async () => {
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new CategoriesRepository(dataService, new TransactionsRepository(dataService));
        spyOn(dataService, 'set').and.callThrough();

        repository.add(new Category());
        repository.add(new Category());

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when category is edited', async () => {
        const a1 = new Category();
        const a2 = new Category();
        const dataService = new TestDataService();
        await dataService.load();
        const repository = new CategoriesRepository(dataService, new TransactionsRepository(dataService));
        spyOn(dataService, 'set').and.callThrough();

        a1.name = 'a1-name';
        a2.name = 'a2-name';
        repository.edit(a1);
        repository.edit(a2);

        expect(dataService.set).toHaveBeenCalledTimes(2);
    });

    it('calls dataService when category is removed', async () => {
        const a1 = new Category();
        const a2 = new Category();
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
    constructor(categories: any = [], transactions: any = []) {
        const notNull = categories != null || transactions != null;
        super(new TestStorage(async () => notNull ? JSON.stringify({
            categories: categories,
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
