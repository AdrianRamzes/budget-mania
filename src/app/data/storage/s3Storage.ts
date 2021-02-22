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
        level: 'private',
        cacheControl: 'no-cache',
    }

    async load() {
        let list = await Storage.list('', this.requestConfig);

        if(!list.find(f => f.key === this.FILE_NAME)) {
            throw new Error(`File ${this.FILE_NAME} not found.`)
        }

        let data = await Storage.get(this.FILE_NAME, {
            ...this.requestConfig,
            download: true,
        });
        return await this.readFile(data);
    }

    async save(data: string): Promise<any> {
        return await Storage.put(this.FILE_NAME, data, this.requestConfig);
    }

    private readFile(data): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                let result = fr.result as string;
                resolve(result);
            };
            fr.onerror = reject;
            fr.readAsText((data as any).Body as Blob);
        });
    }
}