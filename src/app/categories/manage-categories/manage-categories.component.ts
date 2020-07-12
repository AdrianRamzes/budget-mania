import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { NgForm } from '@angular/forms';
import { CategoriesRepository } from 'src/app/data/repositories/categories.repository';

@Component({
    selector: 'app-manage-categories',
    templateUrl: './manage-categories.component.html'
})
export class ManageCategoriesComponent implements OnInit {

    constructor(private categoriesRepository: CategoriesRepository) { }

    categories: Category[];
    selectedCategory: Category;

    ngOnInit() {
        this.categoriesRepository.changed.subscribe(c => this.categories = c);
        this.categories = this.categoriesRepository.list();
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

        this.categoriesRepository.add(cat);

        form.resetForm();
    }

    onEditCategoryClick(form: NgForm): void {
        if (form.dirty) {
            let edited = {
                ...this.selectedCategory,
                ...form.value
            } as Category;
            this.categoriesRepository.edit(edited);
        }
    }

    onRemoveCategoryClick(): void {
        this.categoriesRepository.remove(this.selectedCategory);
    }
}
