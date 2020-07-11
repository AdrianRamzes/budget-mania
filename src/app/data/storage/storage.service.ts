import { LocalStorageHelper } from './localStorage';
import { FakeStorageHelper } from './fakeStorage';
import { StorageHelper } from './storageHelper';
import { environment } from 'src/environments/environment';
import { HttpStorageHelper } from './httpStorage';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { S3StorageHelper } from './s3Storage';

@Injectable()
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
            case "s3":
                this._service = new S3StorageHelper();
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