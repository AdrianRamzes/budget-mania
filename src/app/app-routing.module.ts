import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportComponent } from './import/import.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriesComponent } from './categories/categories.component';
import { AccountsComponent } from './accounts/accounts.component';
import { ManageCategoriesComponent } from './categories/manage-categories/manage-categories.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'import', component: ImportComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'manage-categories', component: ManageCategoriesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
