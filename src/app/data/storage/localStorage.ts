import { StorageHelper } from './storageHelper';

export class LocalStorageHelper implements StorageHelper {

    private readonly storageKey: string = "_data";

    constructor() { }

    save(data: string): Promise<void> {
        localStorage.setItem(this.storageKey, data)
        return Promise.resolve();
    }

    load(): Promise<string> {
        return Promise.resolve(localStorage.getItem(this.storageKey));
    }
}