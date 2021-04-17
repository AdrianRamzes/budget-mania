import { Injectable } from '@angular/core';
import { Storage } from './storage.interface';
import { Storage as S3} from 'aws-amplify';

@Injectable({providedIn: 'root'})
export class S3Storage implements Storage {

    constructor() { }

    private readonly FILE_NAME = 'user-data.json';
    private firstRun = true;

    private readonly customPrefix = {
        public: '',
        protected: '',
        private: ''
    };

    private readonly requestConfig = {
        customPrefix: this.customPrefix,
        level: 'private',
        cacheControl: 'no-cache',
    };

    async get() {
        if (this.firstRun) {
            if (!await this.exists()) {
                await this.put('');
            }
            this.firstRun = false;
        }
        const data = await S3.get(this.FILE_NAME, {
            ...this.requestConfig,
            download: true,
        });
        return await this.readFile(data);
    }

    async put(data: string): Promise<any> {
        return await S3.put(this.FILE_NAME, data, this.requestConfig);
    }

    private async exists(): Promise<boolean> {
        const list = await S3.list('', this.requestConfig);
        return (list as any[]).some(e => e.key === this.FILE_NAME);
    }

    private readFile(data): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                const result = fr.result as string;
                resolve(result);
            };
            fr.onerror = reject;
            fr.readAsText((data as any).Body as Blob);
        });
    }
}
