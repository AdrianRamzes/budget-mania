import { StorageHelper } from './storageHelper';

import { Storage } from 'aws-amplify'
import { reject } from 'lodash';

export class S3StorageHelper implements StorageHelper {

    constructor() { }

    private readonly FILE_NAME = "test123.txt";

    private readonly customPrefix = {
        public: '',
        protected: '',
        private: ''
    };

    private readonly requestConfig = {
        customPrefix: this.customPrefix,
        level: 'private'
    }

    load(): Promise<string> {
        return Storage.list('', this.requestConfig)
        .then(data => {
            if (data.find(f => f.key === this.FILE_NAME)) {
                return Storage.get(this.FILE_NAME, {
                    ...this.requestConfig,
                    download: true
                }).then(data => {
                    console.log(data);
                    return this.readFile(data);
                })
                .catch(err => {
                    console.log(err);
                    return err;
                });
            }
        })
        .catch(err => console.log(err));
    }

    save(data: string): Promise<any> {
        return Promise.resolve(true);
        // return Storage.put(this.FILE_NAME, data, this.requestConfig)
        // .then(data => {
        //     console.log(data);
        //     return data;
        // })
        // .catch(err => {
        //     console.log(err);
        //     reject(err);
        // });
    }

    private readFile(data): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                let result = fr.result as string;
                resolve(result);
            };
            fr.readAsText((data as any).Body as Blob);
        });
    }
}