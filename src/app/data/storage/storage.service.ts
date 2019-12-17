import { LocalStorageHelper } from './localStorage';
import { FakeStorageHelper } from './fakeStorage';
import { StorageHelper } from './storageHelper';
import { environment } from 'src/environments/environment';
import { HttpStorageHelper } from './httpStorage';
import { HttpClient } from '@angular/common/http';

export class StorageService implements StorageHelper {

    private _service: StorageHelper;

    constructor(private httpClient: HttpClient) {
        switch (environment.storageType) {
            case "http":
                this._service = new HttpStorageHelper(this.httpClient);
                break;
            case "local":
                this._service = new LocalStorageHelper();
                break;
            default:
                this._service = new FakeStorageHelper();
                break;
        }
    }

    //TODO: Compression
    //TODO: Encryption
    save(data: string): Promise<void> {
        return this._service.save(data);
    }
    load(): Promise<string> {
        return this._service.load();
    }
}