/**
 * !!README!!
 *
 * Posible states:
 * https://drive.google.com/file/d/1UZJ-UiKBhspE8GxhW0BZRoCXe_E_jEaT/view?usp=sharing
 *                   |  loading  |  dirty   |   saving  |   initialised
 * ------------------+-----------+----------+-----------+--------------
 * Uninitialized     |  fasle    |  false   |   false   |   false
 * Initializing      |  true     |  false   |   false   |   false
 * Ready:            |  false    |  false   |   false   |   true
 * Dirty:            |  false    |  true    |   false   |   true
 * Saving:           |  false    |  true    |   true    |   true
 * Loading:          |  true     |  false   |   false   |   true
 *
 */

import { Storage } from './storage/storage.interface';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataService {

    get state(): DataServiceState {
        return this.getState();
    }
    stateChanged: EventEmitter<DataServiceState> = new EventEmitter();

    initialized = false;
    initializedChanged: EventEmitter<boolean> = new EventEmitter();

    dirty = false;
    dirtyChanged: EventEmitter<boolean> = new EventEmitter();

    loading = false;
    loadingChanged: EventEmitter<boolean> = new EventEmitter();

    saving = false;
    savingChanged: EventEmitter<boolean> = new EventEmitter();

    dataChanged: EventEmitter<string> = new EventEmitter();

    private data: {[key: string]: any} = {};
    private storageGetPromise: Promise<string> = null;
    private storagePutPromise: Promise<void> = null;
    private changedWhileSaving = false;

    constructor(private storage: Storage, skipInitialization: boolean = false) {
        if (!skipInitialization) {
            this.initialize();
        }
    }

    containsKey(key: string): boolean {
        return key in this.data;
    }

    get(key: string): any {
        if (!this.containsKey(key)) {
            return null;
        }
        return this.data[key];
    }

    set(key: string, value: any) {
        const disallowedStates = [
            DataServiceState.Uninitialized,
            DataServiceState.Initializing,
            DataServiceState.Loading,
        ];
        if (disallowedStates.some(x => x === this.state)) {
            throw Error(this.state);
        }
        if (this.containsKey(key) && this.areEqual(this.get(key), value)) {
            return;
        }
        this.data[key] = value;
        if (!this.dirty) {
            this.dirty = true;
            this.dirtyChanged.emit(true);
            this.dataChanged.emit(key);
        }
        if (this.saving) {
            this.changedWhileSaving = true;
        }
    }

    /**
     * Loads data from storage.
     */
    async load(): Promise<void> {
        const disallowedStates = [
            DataServiceState.Dirty,
            DataServiceState.Saving,
        ];
        if (disallowedStates.some(x => x === this.state)) {
            throw Error(this.state);
        }
        if (this.storageGetPromise == null) {
            this.loading = true;
            try {
                if (this.storageGetPromise == null) {
                    this.storageGetPromise = this.storage.get();
                }
                this.loadFromString(await this.storageGetPromise);
                this.storageGetPromise = null;
                if (!this.initialized) {
                    this.initialized = true;
                    this.initializedChanged.emit(true);
                }
            } finally {
                this.loading = false;
            }
        } else {
            await this.storageGetPromise;
        }
    }

    /**
     * Saves data into storage.
     * Calls storage only if dirty.
     */
    async save(): Promise<void> {
        if (this.state === DataServiceState.Dirty ||
            this.state === DataServiceState.Saving) {
            if (this.storagePutPromise == null) {
                this.saving = true;
                this.savingChanged.emit(true);
                try {
                    this.storagePutPromise = this.storage.put(JSON.stringify(this.data));
                    await this.storagePutPromise;
                    this.dirty = this.changedWhileSaving;
                    this.dirtyChanged.emit(false);
                } finally {
                    this.saving = false;
                    this.savingChanged.emit(false);
                    this.storagePutPromise = null;
                }
            } else {
                await this.storagePutPromise;
            }
        }
    }

    private async initialize() {
        await this.load();
    }

    private loadFromString(jsonString: string): void {
        this.data = this.deserialize(jsonString);

        for (const key in this.data) {
            if (Object.prototype.hasOwnProperty.call(this.data, key)) {
                this.dataChanged.emit(key);
            }
        }
    }

    private deserialize(serialized: string): {[key: string]: any} {
        return JSON.parse(serialized) ?? null;
    }

    private areEqual(valueA: any, valueB: any): boolean {
        return JSON.stringify(valueA) === JSON.stringify(valueB);
    }

    private getState(): DataServiceState {
        if (!this.initialized) {
            if (this.loading) {
                return DataServiceState.Initializing;
            }
            return DataServiceState.Uninitialized;
        }
        if (this.loading) {
            return DataServiceState.Loading;
        }
        if (this.saving) {
            return DataServiceState.Saving;
        }
        if (this.dirty) {
            return DataServiceState.Dirty;
        }

        return DataServiceState.Ready;
    }
}

export enum DataServiceState {
    Uninitialized = 'Uninitialized',
    Initializing = 'Initializing',
    Loading = 'Loading',
    Ready = 'Ready',
    Dirty = 'Dirty',
    Saving = 'Saving',
}
