import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImportComponent } from './import/import.component';
import { SelectFileComponent } from './import/select-file/select-file.component';
import { TransactionsListComponent } from './import/transactions-list/transactions-list.component';
import { ImportService } from './import/import.service';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriesComponent } from './categories/categories.component';
import { ManageCategoriesComponent } from './categories/manage-categories/manage-categories.component';
import { DashboardTransactionsComponent } from './dashboard/dashboard-transactions/dashboard-transactions.component';
import { SelectAccountComponent } from './import/select-account/select-account.component';
import { AccountsComponent } from './accounts/accounts.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardCashFlowComponent } from './dashboard/dashboard-cash-flow/dashboard-cash-flow.component';
import { AuthService } from './auth/auth.service';
import { AuthComponent } from './auth/auth.component';
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';

import { awsconfig } from 'aws-exports';

Amplify.configure(awsconfig);


@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    SelectFileComponent,
    TransactionsListComponent,
    HeaderComponent,
    DashboardComponent,
    CategoriesComponent,
    DashboardTransactionsComponent,
    SelectAccountComponent,
    AccountsComponent,
    ManageCategoriesComponent,
    DashboardCashFlowComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AmplifyUIAngularModule
  ],
  providers: [
    ImportService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
