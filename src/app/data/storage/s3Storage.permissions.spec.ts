import { Auth, Storage as S3 } from 'aws-amplify';

import { testusers } from 'aws-exports-test';
import { awsconfig } from 'aws-exports';
import { S3Storage } from './s3Storage';

describe('S3 prod user permissions (uses real S3 connection)', () => {
    const requestConfig = {
        customPrefix: {
            public: '',
            protected: '',
            private: ''
        },
        level: 'private',
        cacheControl: 'no-cache',
    };

    let storage: S3Storage;

    const signIn = async (username: string, password: string) => {
        const user = await Auth.signIn(username, password);
        return user;
    };

    const signOut = async () => {
        await Auth.signOut();
    };

    beforeAll(async () => {
        Auth.configure(awsconfig.Auth);
        S3.configure(awsconfig.Storage);
        await signOut();
    });

    beforeEach(async () => {
        const result = await signIn(testusers.test2.username, testusers.test2.password);
        storage = new S3Storage();
    });

    afterEach(async () => {
        await signOut();
    });

    it('has list permission', async () => {
        const result = await S3.list('user-data.json', requestConfig);

        expect(Array.isArray(result)).toBeTruthy();
    });

    it('has read permission', async () => {
        const result = await S3.get(
            'user-data.json',
            {
                ...requestConfig,
                download: true,
            }
        );

        expect(result).toBeDefined();
    });

    it('has write permission', async () => {
        const value = await storage.get();

        const result = await storage.put(value);

        expect(result).toBeDefined();
    });

    it('has read permission for exchange rate bucket', async () => {
        const result = await S3.get(
            'exchange-rate.json',
            {
                ...requestConfig,
                bucket: 'budget-mania-exchange-rate',
                level: 'public',
                download: true,
            }
        );
        console.log(result);
        expect(result).toBeDefined();
    });
});
