import { Auth, Storage as S3 } from 'aws-amplify';
import { S3Storage } from './s3Storage';

import { testconfig, testusers } from 'aws-exports-test';

xdescribe('S3Storage (uses real S3 connection)', () => {
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
        Auth.configure(testconfig.Auth);
        S3.configure(testconfig.Storage);
        await signOut();
    });

    afterAll(async () => {
        await signOut();
    });

    beforeEach(async () => {
        const result = await signIn(testusers.test2.username, testusers.test2.password);
        storage = new S3Storage();
    });

    it('creates file if does not exist when get is called', async () => {
        let keys = (await S3.list('', requestConfig) as any[]).map(e => e.key);
        await Promise.all(keys.map(key => S3.remove(key, requestConfig)));
        keys = await S3.list('', requestConfig) as any[];
        expect(keys.length).toBe(0);

        const result = await storage.get();
        keys = await S3.list('', requestConfig) as any[];

        expect(result).toBe('');
        expect(keys.length).toBe(1);
    });

    it('creates file if does not exist when put is called', async () => {
        let keys = (await S3.list('', requestConfig) as any[]).map(e => e.key);
        await Promise.all(keys.map(key => S3.remove(key, requestConfig)));
        keys = await S3.list('', requestConfig) as any[];
        expect(keys.length).toBe(0);

        await storage.put('test');

        keys = await S3.list('', requestConfig) as any[];
        expect(keys.length).toBe(1);
    });

    it('saves string into a file and store it at AWS S3', async () => {
        const result = await storage.put('TEST123');
        expect(result['key']).not.toBeNull();
    });

    it('loads string from files stored at AWS S3', async () => {
        await storage.put('TEST MESSAGE!! 123');
        const result = await storage.get();
        expect(result).toBe('TEST MESSAGE!! 123');
    });

    it('saves and loads alphabeth', async () => {
        await storage.put('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const result = await storage.get();
        expect(result).toBe('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('saves and loads numebrs', async () => {
        await storage.put('0123456789');
        const result = await storage.get();
        expect(result).toBe('0123456789');
    });

    it('saves and loads punctuation signs', async () => {
        await storage.put('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
        const result = await storage.get();
        expect(result).toBe('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
    });

    it('saves and loads whitespace signs', async () => {
        await storage.put(' \t\n\r\x0b\x0c');
        const result = await storage.get();
        expect(result).toBe(' \t\n\r\x0b\x0c');
    });

    it('saves and loads polish alphabeth', async () => {
        await storage.put('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
        const result = await storage.get();
        expect(result).toBe('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
    });

});
