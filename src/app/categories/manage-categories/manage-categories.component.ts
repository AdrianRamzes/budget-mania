import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data/data.service';
import { Category } from 'src/app/models/category.model';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-manage-categories',
    templateUrl: './manage-categories.component.html'
})
export class ManageCategoriesComponent implements OnInit {

    constructor(private dataService: DataService) { }

    categories: Category[];
    selectedCategory: Category;

    ngOnInit() {
        this.dataService.categoriesChanged.subscribe(c => this.categories = c);
        this.categories = this.dataService.getCategories();
    }

    onCategorySelected(c): void {
        this.selectedCategory = c;
    }

    onSubmitNewCategory(form: NgForm): void {
        let v = form.value;

        if(form.invalid) {
            //TODO: SET ERROR; migrate to reactive forms https://angular.io/guide/reactive-forms
            return;
        }
        
        let cat = new Category();
        cat.name = v.name;

        this.dataService.addCategory(cat);

        form.resetForm();
    }

    onEditCategoryClick(form: NgForm): void {
        if (form.dirty) {
            let edited = {
                ...this.selectedCategory,
                ...form.value
            } as Category;
            this.dataService.editCategory(edited);
        }
    }

    onRemoveCategoryClick(): void {
        this.dataService.removeCategory(this.selectedCategory);
    }
}
