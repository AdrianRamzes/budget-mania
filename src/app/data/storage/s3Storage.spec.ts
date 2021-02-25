// import { Transaction } from 'src/app/models/transaction.model';
import { Auth, Storage } from 'aws-amplify';
import { S3StorageHelper } from 'src/app/data/storage/s3Storage'
import { StorageHelper } from './storageHelper';

import { testconfig, testusers } from 'aws-exports-test';

describe('S3 Storage', () => {

    let storageHelper: StorageHelper;

    let signIn = async (username: string, password: string) => {
        let user = await Auth.signIn(username, password);
        return user;
    }
    
    let signOut = async () => {
        await Auth.signOut();
    }

    beforeAll(async () => {
        await Auth.configure(testconfig.Auth);
        await Storage.configure(testconfig.Storage);
        await signOut();
    })

    afterAll(async () => {
        await signOut();
    });

    beforeEach(async () => {
        let result = await signIn(testusers.test2.username, testusers.test2.password);
        storageHelper = new S3StorageHelper();
    })

    it('saves string into a file and store it at AWS S3', async (done) => {
        let result = await storageHelper.save('TEST123');
        expect(result['key']).not.toBeNull();
        done();
    })

    it('loads string from files stored at AWS S3', async (done) => {
        await storageHelper.save('TEST MESSAGE!! 123')
        let result = await storageHelper.load();
        expect(result).toBe('TEST MESSAGE!! 123');
        done();
    })

    it('saves and loads alphabeth', async (done) => {
        await storageHelper.save('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        let result = await storageHelper.load();
        expect(result).toBe('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        done();
    })

    it('saves and loads numebrs', async (done) => {
        await storageHelper.save('0123456789')
        let result = await storageHelper.load();
        expect(result).toBe('0123456789');
        done();
    })

    it('saves and loads punctuation signs', async (done) => {
        await storageHelper.save('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
        let result = await storageHelper.load();
        expect(result).toBe('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
        done();
    })

    it('saves and loads whitespace signs', async (done) => {
        await storageHelper.save(' \t\n\r\x0b\x0c')
        let result = await storageHelper.load();
        expect(result).toBe(' \t\n\r\x0b\x0c');
        done();
    })

    it('saves and loads polish alphabeth', async (done) => {
        await storageHelper.save('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ')
        let result = await storageHelper.load();
        expect(result).toBe('aąbcćdeęfghijklłmnńoóprsśtuwyzźżAĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ');
        done();
    })

});
