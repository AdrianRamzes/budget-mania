import * as _ from 'lodash';

export class Category {
    guid: string;
    name: string;
    className: string;
    subcategories: Category[];
}

export class Categories {

    public static Transport: Category = {
        guid: 'ce86e0cf-7f56-4ec8-a005-transport000',
        name: 'Transport',
        className: 'category-transport',
        subcategories: [
            {
                guid: 'ce86e0cf-7f56-4ec8-a005-transport010',
                name: 'Public Transport',
                className: 'category-public-transport',
                subcategories: []
            }
        ],
    };
    public static Food: Category = {
        guid: 'ce86e0cf-7f56-4ec8-a005-00000food000',
        name: 'Food',
        className: 'category-food',
        subcategories: [
            {
                guid: 'groceryf-7f56-4ec8-a005-00000food010',
                name: 'Grocery',
                className: 'category-grocery',
                subcategories: []
            }
        ],
    };

    public static getAll(): Category[] {
        return [
            this.Transport,
            ...this.Transport.subcategories,
            this.Food,
            ...this.Food.subcategories,
        ];
    }

    public static get(guid: string) {
        return _.find(this.getAll(), x => x.guid === guid) ?? null;
    }
}
