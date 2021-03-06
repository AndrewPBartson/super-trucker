import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './modules/app-routing.module';
import { MaterialModule } from './modules/material.module';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AppComponent } from './app.component';
import { UiAreaComponent } from './ui-area/ui-area.component';
import { HeaderComponent } from './ui-area/header/header.component';
import { TripInputComponent } from './ui-area/trip-input/trip-input.component';
import { TripSummaryComponent } from './ui-area/trip-summary/trip-summary.component';
// want to put api key in separate file that is git ignored:
const gmKey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

@NgModule({
  declarations: [
    AppComponent,
    TripInputComponent,
    UiAreaComponent,
    HeaderComponent,
    TripSummaryComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: gmKey
    }),
    PopoverModule.forRoot(),
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
