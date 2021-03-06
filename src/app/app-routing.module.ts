import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportComponent } from './import/import.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { SearchComponent } from './search/search.component';


const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
    { path: 'import', component: ImportComponent, canActivate: [AuthGuard] },
    { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
