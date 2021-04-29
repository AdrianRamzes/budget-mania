import { Guid } from 'guid-typescript';

// TODO: make sure that contains all necessary fields
export class Category {
    readonly guid: string;
    name: string;
    color: string;
    parentName: string; // TODO parent guid?

    constructor(guid: string = null) {
        this.guid = guid != null
            ? Object.freeze(guid)
            : Object.freeze(Guid.create().toString());
    }
}
