import { Auth, Storage as S3 } from 'aws-amplify';
import { S3Storage } from './s3Storage'

import { testconfig, testusers } from 'aws-exports-test';

describe('S3Storage', () => {

    let storage: S3Storage;

    let signIn = async (username: string, password: string) => {
        let user = await Auth.signIn(username, password);
        return user;
    }
    
    let signOut = async () => {
        await Auth.signOut();
    }

    beforeAll(async () => {
        await Auth.configure(testconfig.Auth);
        await S3.configure(testconfig.Storage);
        await signOut();
    })

    afterAll(async () => {
        await signOut();
    });

    beforeEach(async () => {
        let result = await signIn(testusers.test2.username, testusers.test2.password);
        storage = new S3Storage();
    })

    it('saves string into a file and store it at AWS S3', async (done) => {
        let result = await storage.put('TEST123');
        expect(result['key']).not.toBeNull();
        done();
    })

    it('loads string from files stored at AWS S3', async (done) => {
        await storage.put('TEST MESSAGE!! 123')
        let result = await storage.get();
        expect(result).toBe('TEST MESSAGE!! 123');
        done();
    })

    it('saves and loads alphabeth', async (done) => {
        await storage.put('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        let result = await storage.get();
        expect(result).toBe('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        done();
    })

    it('saves and loads numebrs', async (done) => {
        await storage.put('0123456789')
        let result = await storage.get();
        expect(result).toBe('0123456789');
        done();
    })

    it('saves and loads punctuation signs', async (done) => {
        await storage.put('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
        let result = await storage.get();
        expect(result).toBe('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
        done();
    })

    it('saves and loads whitespace signs', async (done) => {
        await storage.put(' \t\n\r\x0b\x0c')
        let result = await storage.get();
        expect(result).toBe(' \t\n\r\x0b\x0c');
        done();
    })

    it('saves and loads polish alphabeth', async (done) => {
        await storage.put('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ')
        let result = await storage.get();
        expect(result).toBe('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
        done();
    })

});
