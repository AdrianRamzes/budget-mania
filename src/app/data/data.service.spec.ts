import { emit } from "process";
import { DataService } from "./data.service";
import { Storage } from "./storage/storage.interface";

describe('DataService', () => {

    beforeAll(async () => {
    })

    afterAll(async () => {
    });

    beforeEach(async () => {
    })

    it('throws exception when invalid data is stored', async (done) => {
        let storage = new TestStorage(async () => {
            return 'INVALID JSON';
        });
        let dataService = new DataService(storage);

        expect(dataService.load).toThrowError();

        done();
    })

    it('does not throw exception when invalid data is stored', async (done) => {
        let storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        });
        let dataService = new DataService(storage);

        expectAsync(dataService.load()).toBeResolved();

        done();
    })

    it('loads value correctly', async (done) => {
        let storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        });
        let dataService = new DataService(storage);

        expect(dataService.get('myKey')).toBeNull();
        await dataService.load();
        expect(dataService.get('myKey')).toBe('myValue');

        done();
    })

    it('loads complex string correctly', async (done) => {
        let storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey1: ['myValue'],
                myKey2: {
                    subkey1: 123,
                    subkey2: 0.123456,
                    subkey3: ['str1', 'str2'],
                    subkey4: null,
                    subkey5: [1,2,3]
                }
            });
        });
        let dataService = new DataService(storage);

        expect(dataService.get('myKey1')).toBeNull();
        expect(dataService.get('myKey2')).toBeNull();
        await dataService.load();
        expect(dataService.get('myKey1')).toEqual(['myValue']);
        expect(dataService.get('myKey2')).not.toBeNull();
        expect(dataService.get('myKey2').subkey1).toEqual(123);
        expect(dataService.get('myKey2').subkey2).toEqual(0.123456);
        expect(dataService.get('myKey2').subkey3).toEqual(['str1', 'str2']);
        expect(dataService.get('myKey2').subkey4).toBeNull();
        expect(dataService.get('myKey2').subkey5).toEqual([1,2,3]);

        done();
    })

    it('has loading state turned on while loading', async (done) => {
        let storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        });
        let dataService = new DataService(storage);
        spyOn(dataService.loadingChanged, 'emit');
        
        expect(dataService.loading).toBeFalsy();
        dataService.load().then(x => {
            expect(dataService.loadingChanged.emit).toHaveBeenCalledWith(false);
            expect(dataService.loading).toBeFalsy();
            done();
        });
        expect(dataService.loadingChanged.emit).toHaveBeenCalledWith(true);
        expect(dataService.loading).toBeTruthy();
    })

    it('has saving state turned on while saving', async (done) => {
        let storage = new TestStorage(null, async () => {});
        let dataService = new DataService(storage);
        spyOn(dataService.savingChanged, 'emit');

        expect(dataService.saving).toBeFalsy();
        dataService.save().then(x => {
            expect(dataService.savingChanged.emit).toHaveBeenCalledWith(false);
            expect(dataService.saving).toBeFalsy();
            done();
        });
        expect(dataService.savingChanged.emit).toHaveBeenCalledWith(true);
        expect(dataService.saving).toBeTruthy();
    })

    it('sets value under given key', async (done) => {
        let dataService = new DataService(new TestStorage());

        dataService.set('key123', 'ABCabc');
        expect(dataService.get('key123')).toBe('ABCabc');

        done();
    })

    it('emits data change event data is set', async (done) => {
        let dataService = new DataService(new TestStorage());
        spyOn(dataService.dataChanged, 'emit');

        dataService.set('key123', 'ABCabc');
        expect(dataService.dataChanged.emit).toHaveBeenCalledWith('key123');

        done();
    })

    it('turns on dirty state when change is not saved', async (done) => {
        let dataService = new DataService(new TestStorage());
        spyOn(dataService.isDirtyChanged, 'emit');
        
        expect(dataService.isDirty).toBeFalsy();
        dataService.set('key123', 'ABCabc');
        expect(dataService.isDirtyChanged.emit).toHaveBeenCalledWith(true);
        expect(dataService.isDirty).toBeTruthy();

        done();
    })

    it('turns off dirty state when change is saved', async (done) => {
        let storage = new TestStorage(null, async () => {});
        let dataService = new DataService(storage);
        spyOn(dataService.isDirtyChanged, 'emit');

        dataService.set('key123', 'ABCabc');
        expect(dataService.isDirty).toBeTruthy();
        await dataService.save();
        expect(dataService.isDirtyChanged.emit).toHaveBeenCalledWith(false);
        expect(dataService.isDirty).toBeFalsy();
        done();
    })

});

class TestStorage implements Storage{

    constructor(get: () => Promise<string> = null, put: (data: string) => Promise<void> = null) {
        this.get = get;
        this.put = put;
    }
    get: () => Promise<string>;
    put: (data: string) => Promise<void>;
}