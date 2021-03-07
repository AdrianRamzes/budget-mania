import { Auth, Storage as S3 } from 'aws-amplify';
import { S3Storage } from './s3Storage';

import { testconfig, testusers } from 'aws-exports-test';

xdescribe('S3Storage (uses real S3 connection)', () => {

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

    it('saves string into a file and store it at AWS S3', async (done) => {
        const result = await storage.put('TEST123');
        expect(result['key']).not.toBeNull();
        done();
    });

    it('loads string from files stored at AWS S3', async (done) => {
        await storage.put('TEST MESSAGE!! 123');
        const result = await storage.get();
        expect(result).toBe('TEST MESSAGE!! 123');
        done();
    });

    it('saves and loads alphabeth', async (done) => {
        await storage.put('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const result = await storage.get();
        expect(result).toBe('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        done();
    });

    it('saves and loads numebrs', async (done) => {
        await storage.put('0123456789');
        const result = await storage.get();
        expect(result).toBe('0123456789');
        done();
    });

    it('saves and loads punctuation signs', async (done) => {
        await storage.put('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
        const result = await storage.get();
        expect(result).toBe('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
        done();
    });

    it('saves and loads whitespace signs', async (done) => {
        await storage.put(' \t\n\r\x0b\x0c');
        const result = await storage.get();
        expect(result).toBe(' \t\n\r\x0b\x0c');
        done();
    });

    it('saves and loads polish alphabeth', async (done) => {
        await storage.put('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
        const result = await storage.get();
        expect(result).toBe('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
        done();
    });

});
