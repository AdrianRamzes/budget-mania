import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImportComponent } from './import/import.component';
import { SelectFileComponent } from './import/select-file/select-file.component';
import { TransactionsList2Component } from './import/transactions-list2/transactions-list2.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { ImportService } from './import/import.service';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectAccountComponent } from './import/select-account/select-account.component';
import { AccountsComponent } from './accounts/accounts.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardCashFlowComponent } from './dashboard/dashboard-cash-flow/dashboard-cash-flow.component';
import { AuthService } from './auth/auth.service';
import { AuthComponent } from './auth/auth.component';
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import { S3Storage } from './data/storage/s3Storage';

import { awsconfig } from 'aws-exports';
import { SearchComponent } from './search/search.component';
import { TransactionComponent } from './components/transaction/transaction.component';

Amplify.configure(awsconfig);


@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    SelectFileComponent,
    TransactionsList2Component,
    TransactionsListComponent,
    HeaderComponent,
    DashboardComponent,
    SelectAccountComponent,
    AccountsComponent,
    DashboardCashFlowComponent,
    AuthComponent,
    SearchComponent,
    TransactionComponent
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
    AuthService,
    { provide: Storage, useClass: S3Storage},
    { provide: 'skipInitialization', useValue: false},
    { provide: 'skipInitialLoading', useValue: false },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
