import { Guid } from 'guid-typescript';

// TODO: make sure that contains all necessary fields
export class Category {
    guid: string;
    name: string;
    color: string;
    parentName: string; // TODO parent guid?

    constructor() {
        this.guid = Guid.create().toString();
    }
}
