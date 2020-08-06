import * as _ from "lodash";

import { BetterDataService } from '../betterdata.service';
import { Category } from 'src/app/models/category.model';
import { Guid } from "guid-typescript";
import { EventEmitter, Injectable } from '@angular/core';
import { TransactionsRepository } from './transactions.repository';

@Injectable({providedIn: 'root'})
export class CategoriesRepository {

    changed: EventEmitter<Category[]> = new EventEmitter();

    private readonly _KEY: string = "categories";

    private _categories: Category[] = null;

    constructor(private betterDataService: BetterDataService,
                private transactionsRepository: TransactionsRepository) {

        this.betterDataService.dataChanged.subscribe(key => {
            if(key == this._KEY) {
                this.load();
                this.changed.emit(this.list());
            }
        })
    }

    list(): Category[] {
        if(this._categories == null) {
            this.load();
        }
        return this._categories.slice();
    }
    
    get(guid: string): Category {
        return _.find(this._categories, c => c.guid === guid) || null;
    }

    add(c: Category) {
        let categories = this.list();
        categories.push(c);
        this.set(categories);
    }

    edit(c: Category) {
        let categories = this.list();
        let i = _.findIndex(categories, { guid: c.guid });
        categories[i] = c;
        this.set(categories);
    }

    remove(c: Category) {
        let categories = this.list();
        _.remove(categories, (x) => x.guid === c.guid);
        this.set(categories);

        let transactions = this.transactionsRepository.list()
            .filter(x => x.categoryGuid == c.guid);
        
        _.forEach(transactions, t => t.categoryGuid = null);

        this.transactionsRepository.editMany(transactions);
    }

    private load(): void {
        if(this.betterDataService.containsKey(this._KEY)) {
            let deserialized = this.betterDataService.get(this._KEY);
            this._categories = this.deserialize(deserialized);
        } else {
            this._categories = [];
        }
    }

    private set(value: Category[]) {
        this._categories = (value || []).slice();
        this.betterDataService.set(this._KEY, this._categories);
    }

    private deserialize(deserialized: any[]): Category[] {
        return (deserialized || []).map(c => {
            let cat = new Category();
            cat.guid = c.guid || Guid.create().toString();
            cat.color = c.color;
            cat.name = c.name;
            cat.parentName = c.parentName;
            return cat;
        });
    }
}