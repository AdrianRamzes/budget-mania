import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { StorageHelper } from './storageHelper';

export class HttpStorageHelper implements StorageHelper {

    private readonly _url: string;
    private readonly _apiKey: string;

    constructor(private httpClient: HttpClient) {
        this._url = environment.httpStorageConfig.url;
        this._apiKey = environment.httpStorageConfig.apiKey;
    }

    load(): Promise<string> {
        let requestOptions = {
            headers: new HttpHeaders({
                "Content-Type": "text/plain;charset=UTF-8",
                "x-api-key": this._apiKey,
            })
        };

        return this.httpClient.get<string>(this._url, requestOptions).toPromise();
    }

    save(data: string): Promise<any> {
        let form = new FormData();
        form.append("data", JSON.stringify(data));//need to stringify again
        let requestOptions = {
            headers: new HttpHeaders({ "x-api-key": environment.httpStorageConfig.apiKey })
        };
        return this.httpClient.post<any>(this._url, form, requestOptions).toPromise()
    }
}