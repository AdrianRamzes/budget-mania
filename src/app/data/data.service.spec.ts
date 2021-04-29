import { DataService, DataServiceState } from './data.service';
import { Storage } from './storage/storage.interface';

/** TODO: Check what if starage returns {'key': null}
 * and check repositoreis how do they react to that?
 */

describe('DataSevice Uninitialized', () => {

    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    const getDataServiceInUninitializedState =
        (storage: TestStorage = getDummyStorage()) =>
            new DataService(storage, /*skipInitialization*/ true);

    it('is in uninitialized state', async () => {
        const dataService1 = getDataServiceInUninitializedState();
        const storage2 = getDummyStorage();
        const dataService2 = getDataServiceInUninitializedState(storage2);

        expect(dataService1.state).toBe(DataServiceState.Uninitialized);
        expect(dataService2.state).toBe(DataServiceState.Uninitialized);
    });

    it('is uninitialized at the beginning', () => {
        const storage = new TestStorage(async () => '');
        const dataService = new DataService(storage, /*skipInitialization*/ true);

        expect(dataService.state).toBe(DataServiceState.Uninitialized);
    });

    it('changes state to initializing when creating new instance', () => {
        const storage = new TestStorage(async () => '');
        spyOn(storage, 'get').and.callThrough();
        const dataService = new DataService(storage);

        expect(dataService.state).toBe(DataServiceState.Initializing);
        expect(storage.get).toHaveBeenCalled();
    });

    it('changes state to initializing when load is called', () => {
        const storage = getDummyStorage();
        spyOn(storage, 'get').and.callThrough();
        const dataService = getDataServiceInUninitializedState(storage);

        dataService.load();
        expect(storage.get).toHaveBeenCalled();
        expect(dataService.state).toBe(DataServiceState.Initializing);
    });

    it('emits event when state has been changed to initializing', async () => {
        const dataService = getDataServiceInUninitializedState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        dataService.load();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Initializing);
    });

    it('changes state to uninitialized when initializing is rejected', async () => {
        const storage = new TestStorage(() => Promise.reject());
        const dataService = getDataServiceInUninitializedState(storage);

        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.state).toBe(DataServiceState.Uninitialized);
    });

    it('emits event when state has been changed back to uninitialized', async () => {
        const storage = new TestStorage(() => Promise.reject());
        const dataService = getDataServiceInUninitializedState(storage);
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.stateChanged.emit).toHaveBeenCalledTimes(2);
        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Uninitialized);
    });

    it('returns null when get is called (no data)', () => {
        const dataService = getDataServiceInUninitializedState();

        expect(dataService.get('myKey')).toBeNull();
    });

    it('throws error when set is called', () => {
        const dataService = getDataServiceInUninitializedState();

        expect(() => dataService.set('myKey', 'myValue')).toThrowError('Uninitialized');
    });

    it('does nothing when save is called (not dirty)', async () => {
        const storage = getDummyStorage();
        spyOn(storage, 'put').and.callThrough();
        const dataService = getDataServiceInUninitializedState(storage);

        await expectAsync(dataService.save()).toBeResolved();
        expect(storage.put).not.toHaveBeenCalled();
    });
});

describe('DataSevice Initializing', () => {

    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    const getDataServiceInInitializingState =
        (storage: TestStorage = getDummyStorage()) => new DataService(storage);

    it('is in initializing state', async () => {
        const dataService1 = getDataServiceInInitializingState();
        const storage2 = getDummyStorage();
        const dataService2 = getDataServiceInInitializingState(storage2);

        expect(dataService1.state).toBe(DataServiceState.Initializing);
        expect(dataService2.state).toBe(DataServiceState.Initializing);
    });

    it('returns null when get is called (no data)', () => {
        const dataService = getDataServiceInInitializingState();

        expect(dataService.get('myKey')).toBeNull();
    });

    it('throws error when set is called', () => {
        const dataService = getDataServiceInInitializingState();

        expect(() => dataService.set('myKey', 'myValue')).toThrowError('Initializing');
    });

    it('does not make duplicate requests when load is called multiple times', async () => {
        const storage = getDummyStorage();
        spyOn(storage, 'get').and.callThrough();
        const dataService = getDataServiceInInitializingState(storage);

        await Promise.all([
            dataService.load(),
            dataService.load(),
            dataService.load(),
        ]);

        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('does nothing when save is called (not dirty)', async () => {
        const storage = getDummyStorage();
        spyOn(storage, 'put').and.callThrough();
        const dataService = getDataServiceInInitializingState();

        await expectAsync(dataService.save()).toBeResolved();

        expect(storage.put).not.toHaveBeenCalled();
    });

    it('handles empty storage', async () => {
        const storage = new TestStorage(async () => '', async () => { });
        const dataService = getDataServiceInInitializingState(storage);

        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.get('someKey')).toBeNull();
    });

    it('handles invalid storage ("}}}")', async () => {
        const storage = new TestStorage(async () => '}}}', async () => { });
        const dataService = getDataServiceInInitializingState(storage);

        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.get('someKey')).toBeNull();
    });

    it('handles invalid storage (null)', async () => {
        const storage = new TestStorage(async () => null, async () => { });
        const dataService = getDataServiceInInitializingState(storage);

        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.get('someKey')).toBeNull();
    });

    it('handles invalid storage ("null")', async () => {
        const storage = new TestStorage(async () => 'null', async () => { });
        const dataService = getDataServiceInInitializingState(storage);

        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.get('someKey')).toBeNull();
    });

    it('changes state to ready when initializing is resolved', async () => {
        const dataService = getDataServiceInInitializingState();

        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.state).toBe(DataServiceState.Ready);
    });

    it('emits event when state has been changed to ready', async () => {
        const dataService = getDataServiceInInitializingState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        await dataService.load();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Ready);
    });

    it('changes state to uninitialized when initializing is rejected', async () => {
        const storage = new TestStorage(() => Promise.reject());
        const dataService = getDataServiceInInitializingState(storage);

        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.state).toBe(DataServiceState.Uninitialized);
    });

    it('emits event when state has been changed to uninitialized', async () => {
        const storage = new TestStorage(() => Promise.reject());
        const dataService = getDataServiceInInitializingState(storage);
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Uninitialized);
    });
});

describe('DataSevice Ready', () => {

    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    const getDataServiceInReadyState = async (storage: TestStorage = getDummyStorage()) => {
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        // here is Ready
        return dataService;
    };

    it('is in ready state', async () => {
        const dataService1 = await getDataServiceInReadyState();
        const storage2 = getDummyStorage();
        const dataService2 = await getDataServiceInReadyState(storage2);

        expect(dataService1.state).toBe(DataServiceState.Ready);
        expect(dataService2.state).toBe(DataServiceState.Ready);
    });

    it('returns correct value when get is called', async () => {
        const dataService = await getDataServiceInReadyState();

        expect(dataService.get('myKey')).toBe('myValue');
    });

    it('returns a deep copy of the real value when get is called', async () => {
        const storage = new TestStorage(async () => {
            return JSON.stringify({myKey: [1, 2, 3]});
        });
        const dataService = await getDataServiceInReadyState(storage);
        let value = dataService.get('myKey');

        value[0] = 4;
        value = dataService.get('myKey');

        expect(value).toEqual([1, 2, 3]);
    });

    it('sets correct value when set is called', async () => {
        const dataService = await getDataServiceInReadyState();

        expect(dataService.set('myKey', 'someValue123'));
        expect(dataService.get('myKey')).toBe('someValue123');
    });

    it('emits data changed event when set is called', async () => {
        const dataService = await getDataServiceInReadyState();
        spyOn(dataService.dataChanged, 'emit').and.callThrough();

        expect(dataService.set('myKey', 'someValue123'));

        expect(dataService.dataChanged.emit).toHaveBeenCalledWith('myKey');
    });

    it('returns promise when load is called', async () => {
        const storage = getDummyStorage();
        const dataService = await getDataServiceInReadyState(storage);
        spyOn(storage, 'get').and.callThrough();

        const loadPromise = dataService.load();

        expect(loadPromise instanceof Promise).toBeTruthy();
        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('does not make duplicate requests when load is called multiple times', async () => {
        const storage = getDummyStorage();
        const dataService = await getDataServiceInReadyState(storage);
        spyOn(storage, 'get').and.callThrough();

        await Promise.all([
            dataService.load(),
            dataService.load(),
            dataService.load(),
        ]);

        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('loads correct simple json', async () => {
        const dataService = await getDataServiceInReadyState();

        expect(dataService.get('myKey')).toBe('myValue');
    });

    it('loads correct complex json', async () => {
        const storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey1: ['myValue'],
                myKey2: {
                    subkey1: 123,
                    subkey2: 0.123456,
                    subkey3: ['str1', 'str2'],
                    subkey4: null,
                    subkey5: [1, 2, 3]
                }
            });
        });
        const dataService = await getDataServiceInReadyState(storage);

        expect(dataService.get('myKey1')).toEqual(['myValue']);
        expect(dataService.get('myKey2')).not.toBeNull();
        expect(dataService.get('myKey2').subkey1).toEqual(123);
        expect(dataService.get('myKey2').subkey2).toEqual(0.123456);
        expect(dataService.get('myKey2').subkey3).toEqual(['str1', 'str2']);
        expect(dataService.get('myKey2').subkey4).toBeNull();
        expect(dataService.get('myKey2').subkey5).toEqual([1, 2, 3]);
    });

    it('does nothing when save is called (not dirty)', async () => {
        const storage = getDummyStorage();
        spyOn(storage, 'put').and.callThrough();
        const dataService = await getDataServiceInReadyState(storage);

        await dataService.save();

        expect(storage.put).not.toHaveBeenCalled();
    });

    it('changes state to loading when load is called', async () => {
        const dataService = await getDataServiceInReadyState();

        dataService.load();

        expect(dataService.state).toBe(DataServiceState.Loading);
    });

    it('emits event when state has been changed to dirty', async () => {
        const dataService = await getDataServiceInReadyState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        dataService.load();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Loading);
    });

    it('changes state to dirty when set is called', async () => {
        const dataService = await getDataServiceInReadyState();

        dataService.set('myKey', 'newValue');
        expect(dataService.state).toBe(DataServiceState.Dirty);
    });

    it('emits event when state has been changed to dirty', async () => {
        const dataService = await getDataServiceInReadyState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        dataService.set('myKey', 'newValue');

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Dirty);
    });

    it('does not change state when set does not change value', async () => {
        const storage = new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'oldValue'
            });
        });
        const dataService = await getDataServiceInReadyState(storage);

        dataService.set('myKey', 'oldValue');
        expect(dataService.state).toBe(DataServiceState.Ready);
    });
});

describe('DataSevice Loading', () => {

    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    it('is in the loading state', async () => {
        const dataService = new DataService(getDummyStorage());
        await dataService.load(); // initializing
        dataService.load(); // start loading

        expect(dataService.state).toBe(DataServiceState.Loading);
    });

    it('returns correct value when get is called', async () => {
        const dataService = new DataService(getDummyStorage());
        await dataService.load(); // initializing
        dataService.load(); // start loading

        expect(dataService.get('myKey')).toBe('myValue');
    });

    it('throws error when set is called', async () => {
        const dataService = new DataService(getDummyStorage());
        await dataService.load(); // initializing
        dataService.load(); // start loading

        expect(dataService.state).toBe(DataServiceState.Loading);
        expect(() => dataService.set('test', 'test')).toThrowError('Loading');
    });

    it('does not make duplicate requests when load is called', async () => {
        const storage = getDummyStorage();
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        spyOn(storage, 'get').and.callThrough();
        dataService.load(); // start loading

        await Promise.all([
            dataService.load(),
            dataService.load(),
            dataService.load(),
        ]);

        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('does nothing when save is called (not dirty)', async () => {
        const storage = getDummyStorage();
        spyOn(storage, 'put').and.callThrough();
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        dataService.load(); // start loading

        await dataService.save();

        expect(storage.put).not.toHaveBeenCalled();
    });

    it('changes state to ready when promise is rejected', async () => {
        let firstCall = true;
        const storage = new TestStorage(() => {
            if (firstCall) {
                firstCall = false;
                return Promise.resolve(JSON.stringify({myKey: 'myValue'}));
            }
            return Promise.reject();
        });
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        dataService.load(); // start loading

        expect(dataService.state).toBe(DataServiceState.Loading);
        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.state).toBe(DataServiceState.Ready);
    });

    it('emits event when state has been changed to ready after rejection', async () => {
        let firstCall = true;
        const storage = new TestStorage(() => {
            if (firstCall) {
                firstCall = false;
                return Promise.resolve(JSON.stringify({myKey: 'myValue'}));
            }
            return Promise.reject();
        });
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        dataService.load(); // start loading

        spyOn(dataService.stateChanged, 'emit').and.callThrough();
        await expectAsync(dataService.load()).toBeRejected();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Ready);
    });

    it('changes state to ready when promise is resolved', async () => {
        const dataService = new DataService(getDummyStorage());
        await dataService.load(); // initializing
        dataService.load(); // start loading

        expect(dataService.state).toBe(DataServiceState.Loading);
        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.state).toBe(DataServiceState.Ready);
    });

    it('emits event when state has been changed to ready after resolve', async () => {
        const dataService = new DataService(getDummyStorage());
        await dataService.load(); // initializing
        dataService.load(); // start loading

        spyOn(dataService.stateChanged, 'emit').and.callThrough();
        await expectAsync(dataService.load()).toBeResolved();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Ready);
    });
});

describe('DataSevice Dirty', () => {

    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    const getDataServiceInDirtyState = async (storage: TestStorage = getDummyStorage()) => {
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        dataService.set('myKey', 'newValue');
        return dataService;
    };

    it('is in dirty state', async () => {
        const dataService1 = await getDataServiceInDirtyState();
        const storage2 = getDummyStorage();
        const dataService2 = await getDataServiceInDirtyState(storage2);

        expect(dataService1.state).toBe(DataServiceState.Dirty);
        expect(dataService2.state).toBe(DataServiceState.Dirty);
    });

    it('returns correct value when get is called', async () => {
        const dataService = await getDataServiceInDirtyState();

        expect(dataService.get('myKey')).toBe('newValue');
    });

    it('sets correct value when set is called', async () => {
        const dataService = await getDataServiceInDirtyState();

        dataService.set('myKey', 'someValue123');

        expect(dataService.get('myKey')).toBe('someValue123');
    });

    it('emits data changed event when set is called', async () => {
        const dataService = await getDataServiceInDirtyState();
        spyOn(dataService.dataChanged, 'emit').and.callThrough();

        dataService.set('myKey', 'someValue123');

        expect(dataService.dataChanged.emit).toHaveBeenCalledWith('myKey');
    });

    it('throws error when load is called', async () => {
        const dataService = await getDataServiceInDirtyState();

        await expectAsync(dataService.load()).toBeRejected('Dirty');
    });

    it('returns promise when save is called', async () => {
        const storage = getDummyStorage();
        const dataService = await getDataServiceInDirtyState(storage);
        spyOn(storage, 'put').and.callThrough();

        await expectAsync(dataService.save()).toBeResolved();

        expect(storage.put).toHaveBeenCalled();
    });

    it('does not make duplicate requests when save is called multiple times', async () => {
        const storage = getDummyStorage();
        const dataService = await getDataServiceInDirtyState(storage);
        spyOn(storage, 'put').and.callThrough();

        await Promise.all([
            dataService.save(),
            dataService.save(),
            dataService.save(),
        ]);

        expect(storage.put).toHaveBeenCalledTimes(1);
    });

    it('does not change state when set is called', async () => {
        const dataService = await getDataServiceInDirtyState();

        expect(dataService.state).toBe(DataServiceState.Dirty);
        dataService.set('myKey', 'someValye123');

        expect(dataService.state).toBe(DataServiceState.Dirty);
    });

    it('changes state to saving when save is called', async () => {
        const dataService = await getDataServiceInDirtyState();

        dataService.save();

        expect(dataService.state).toBe(DataServiceState.Saving);
    });

    it('emits event when state has been changed to saving', async () => {
        const dataService = await getDataServiceInDirtyState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        dataService.save();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Saving);
    });
});

describe('DataSevice Saving', () => {
    const getDummyStorage = () => {
        return new TestStorage(async () => {
            return JSON.stringify({
                myKey: 'myValue'
            });
        }, async () => {});
    };

    const getDataServiceInDirtyState = async (storage: TestStorage = getDummyStorage()) => {
        const dataService = new DataService(storage);
        await dataService.load(); // initializing
        dataService.set('myKey', 'newValue');
        return dataService;
    };

    it('is in saving state', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();

        expect(dataService.state).toBe(DataServiceState.Saving);
    });

    it('returns correct value when get is called', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();

        expect(dataService.get('myKey')).toBe('newValue');
    });

    it('sets correct value when set is called', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();

        dataService.set('myKey', 'someValue123');

        expect(dataService.get('myKey')).toBe('someValue123');
    });

    it('emits data changed event when set is called', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();
        spyOn(dataService.dataChanged, 'emit').and.callThrough();

        dataService.set('myKey', 'someValue123');

        expect(dataService.dataChanged.emit).toHaveBeenCalledWith('myKey');
    });

    it('throws error when load is called', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();

        await expectAsync(dataService.load()).toBeRejected('Saving');
    });

    it('does not make duplicate requests when save is called', async () => {
        const storage = getDummyStorage();
        const dataService = await getDataServiceInDirtyState(storage);
        spyOn(storage, 'put').and.callThrough();
        dataService.save();

        await Promise.all([
            dataService.save(),
            dataService.save(),
            dataService.save(),
        ]);

        expect(storage.put).toHaveBeenCalledTimes(1);
    });

    it('changes state to ready when promise is resolved', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();

        await expectAsync(dataService.save()).toBeResolved();

        expect(dataService.state).toBe(DataServiceState.Ready);
    });

    it('emits event when state has been changed to ready', async () => {
        const dataService = await getDataServiceInDirtyState();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        await dataService.save();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Ready);
    });

    it('changes state to dirty when promise is rejected', async () => {
        const storage = new TestStorage(
            async () => JSON.stringify({myKey: 'myValue'}),
            () => Promise.reject()
        );
        const dataService = await getDataServiceInDirtyState(storage);
        dataService.save();

        await expectAsync(dataService.save()).toBeRejected();

        expect(dataService.state).toBe(DataServiceState.Dirty);
    });

    it('emits event when state has been changed to dirty after rejection', async () => {
        const storage = new TestStorage(
            async () => JSON.stringify({myKey: 'myValue'}),
            () => Promise.reject()
        );
        const dataService = await getDataServiceInDirtyState(storage);
        dataService.save();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        await expectAsync(dataService.save()).toBeRejected();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Dirty);
    });

    it('changes state to dirty when promise is resolved but set was called', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();
        expect(dataService.state).toBe(DataServiceState.Saving);

        dataService.set('someKey', 'someValue');
        await expectAsync(dataService.save()).toBeResolved();

        expect(dataService.state).toBe(DataServiceState.Dirty);
    });

    it('emits event when state has been changed to dirty after resolve', async () => {
        const dataService = await getDataServiceInDirtyState();
        dataService.save();
        spyOn(dataService.stateChanged, 'emit').and.callThrough();

        dataService.set('someKey', 'someValue');
        await dataService.save();

        expect(dataService.stateChanged.emit).toHaveBeenCalledWith(DataServiceState.Dirty);
    });
});

class TestStorage implements Storage{

    constructor(get: () => Promise<string> = null, put: (data: string) => Promise<void> = null) {
        this.get = get;
        this.put = put;
    }
    get: () => Promise<string>;
    put: (data: string) => Promise<void>;
}
