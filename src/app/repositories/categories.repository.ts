import * as _ from 'lodash';

import { Category } from 'src/app/models/category.model';
import { DataService } from '../data/data.service';
import { EventEmitter, Injectable } from '@angular/core';
import { TransactionsRepository } from './transactions.repository';

@Injectable({providedIn: 'root'})
export class CategoriesRepository {

    private static readonly _KEY: string = 'categories';

    changed: EventEmitter<void> = new EventEmitter();

    private _CATEGORIES: Category[] = null;

    constructor(private dataService: DataService,
                private transactionsRepository: TransactionsRepository) {

        this.dataService.dataChanged.subscribe(key => {
            if (key === CategoriesRepository._KEY) {
                this.load();
                this.changed.emit();
            }
        });
        this.load();
    }

    list(): Category[] {
        return this.fixTypes(this.deepClone(this._CATEGORIES));
    }

    contains(guid: string): boolean {
        return this._CATEGORIES.findIndex(e => e.guid === guid) >= 0;
    }

    get(guid: string): Category {
        if (!this.contains(guid)) {
            return null;
        }

        return this._CATEGORIES.find(e => e.guid === guid);
    }

    add(c: Category) {
        this._CATEGORIES.push(c);
        this.update();
    }

    edit(c: Category) {
        const i = _.findIndex(this._CATEGORIES, { guid: c.guid });
        this._CATEGORIES[i] = c;
        this.update();
    }

    remove(guid: string) {
        _.remove(this._CATEGORIES, (x) => x.guid === guid);
        this.update();

        const transactions = this.transactionsRepository.list()
            .filter(x => x.categoryGuid === guid);

        _.forEach(transactions, t => t.categoryGuid = null);

        this.transactionsRepository.editMany(transactions);
    }

    private load(): void {
        if (this.dataService.containsKey(CategoriesRepository._KEY)) {
            const data = this.dataService.get(CategoriesRepository._KEY);
            this._CATEGORIES = this.fixTypes(data);
        } else {
            this._CATEGORIES = [];
        }
    }

    private update() {
        this.dataService.set(CategoriesRepository._KEY, this._CATEGORIES);
    }

    private deepClone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    private fixTypes(deserialized: any[]): Category[] {
        return (deserialized ?? []).map(c => {
            const cat = new Category(c.guid);
            cat.color = c.color || null;
            cat.name = c.name || null;
            cat.parentName = c.parentName || null;
            return cat;
        });
    }
}
