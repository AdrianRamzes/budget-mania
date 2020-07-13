import { StorageHelper } from './storageHelper';

import { Storage } from 'aws-amplify'

export class S3StorageHelper implements StorageHelper {

    constructor() { }

    private readonly FILE_NAME = "user-data.json";

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
        return new Promise<string>((resolve, reject) => {
            Storage.list('', this.requestConfig)
            .then(list => {
                if (list.find(f => f.key === this.FILE_NAME)) {
                    return Storage.get(this.FILE_NAME, {
                        ...this.requestConfig,
                        download: true
                    })
                    .then(data => {
                        this.readFile(data)
                        .then(str => resolve(str))
                        .catch(err => reject(err));
                    })
                    .catch(err => {
                        reject(err)
                    });
                } else {
                    reject(`File ${this.FILE_NAME} not found.`)
                }
            })
            .catch(err => {
                reject(err)
            });
        });
    }

    save(data: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Storage.put(this.FILE_NAME, data, this.requestConfig)
            .then(data => {
                console.log("Saved");
                console.log(data);
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
        });
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