import { Guid } from 'guid-typescript';

export class Category {
    guid: string;
    name: string;
    color: string;
    parentName: string;

    constructor() {
        this.guid = Guid.create().toString();
    }
}