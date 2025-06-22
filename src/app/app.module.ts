import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './shared/material.module';

// Components
import { AppComponent } from './app.component';
import { IncomeComponent } from './components/dashboard/income/income.component';
import { AddIncomeDialogComponent } from './components/dashboard/income/add-income-dialog/add-income-dialog.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    MaterialModule,
    ReactiveFormsModule,
    
    AppComponent,
    IncomeComponent,
    AddIncomeDialogComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }