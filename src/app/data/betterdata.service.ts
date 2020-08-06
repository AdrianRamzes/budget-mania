import { StorageService } from './storage/storage.service';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class BetterDataService {

    isDirty: boolean = false;
    isDirtyChanged: EventEmitter<boolean> = new EventEmitter();

    loading: boolean = false;
    loadingChanged: EventEmitter<boolean> = new EventEmitter();
    saving: boolean = false;
    savingChanged: EventEmitter<boolean> = new EventEmitter();

    dataChanged: EventEmitter<string> = new EventEmitter();

    private _data: {[key: string]: any} = {};

    constructor(private storageService: StorageService) {
        this.load();
    }

    containsKey(key: string): boolean {
        return key in this._data;
    }

    get(key: string): any {
        return this._data[key];
    }

    set(key: string, value: any) {
        this._data[key] = value;
        this.isDirty = true;
        this.isDirtyChanged.emit(true);
        this.dataChanged.emit(key);
    }

    save(): Promise<any> {
        this.saving = true;
        this.savingChanged.emit(true);
        return this.storageService.save(JSON.stringify(this._data))
            .then(x => {
                this.isDirty = false;
                this.isDirtyChanged.emit(false);
            })
            .finally(() => {
                this.saving = false;
                this.savingChanged.emit(false);
            });
    }

    load(): Promise<void> {
        this.loading = true;
        this.loadingChanged.emit(true);
        return this.storageService.load()
            .then(data => {
                this.loadFromString(data);
            })
            .catch(err => console.error(err))
            .finally(() => {
                this.loading = false;
                this.loadingChanged.emit(false);
            })
    }

    private loadFromString(jsonString: string): void {
        this._data = this.deserialize(jsonString);

        for(let key in this._data) {
            this.dataChanged.emit(key);
        }
    }

    private deserialize(serialized: string): {[key: string]: any} {
        let deserialized = JSON.parse(serialized);

        if (deserialized) {
            return deserialized;
        }
    }
}
