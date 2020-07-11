import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './data/data.service';
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
import { StorageService } from './data/storage/storage.service';
import { AccountsComponent } from './accounts/accounts.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardCashFlowComponent } from './dashboard/dashboard-cash-flow/dashboard-cash-flow.component';
import { AuthService } from './auth/auth.service';
import { AuthComponent } from './auth/auth.component';
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'eu-central-1:bed78bd0-921f-4d0c-9af7-018d6bac45e5',

        // REQUIRED - Amazon Cognito Region
        region: 'eu-central-1',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-central-1_RBd43RtGv',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '3md8krt2g1jmd6jdd7tk505adp',
    },
    Storage: {
        AWSS3: {
            bucket: 'budget-mania-test-user-data', //REQUIRED -  Amazon S3 bucket
            region: 'eu-central-1', //OPTIONAL -  Amazon service region
        }
    }
});

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
    DataService,
    ImportService,
    StorageService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
