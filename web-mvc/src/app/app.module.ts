import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './modules/app-routing.module';
import { MaterialModule } from './modules/material.module';
import { NgxSpinnerModule } from "ngx-spinner";
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AppComponent } from './app.component';
import { HeaderComponent } from './ui-area/header/header.component';
import { LoginComponent } from './ui-area/login-register/login/login.component';
import { LoginRegisterComponent } from './ui-area/login-register/login-register.component';
import { MapComponent } from './map/map.component';
import { RegisterComponent } from './ui-area/login-register/register/register.component';
import { TripInputComponent } from './ui-area/trip-input/trip-input.component';
import { TripSummaryComponent } from './ui-area/trip-summary/trip-summary.component';
import { TripTemplateComponent } from './ui-area/trip-template/trip-template.component';
import { UiAreaComponent } from './ui-area/ui-area.component';
import { UserProfileComponent } from './ui-area/user-profile/user-profile.component';
import { environment } from 'src/environments/environment';

import {
  NgxMatDatetimePickerModule,
  NgxMatDateFormats,
  NGX_MAT_DATE_FORMATS,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';

const CUSTOM_PARSE_DATE_INPUT = 'l, LTS';
const CUSTOM_DISPLAY_DATE_INPUT = 'ddd MM/DD - hh:mm a';
const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: CUSTOM_PARSE_DATE_INPUT
  },
  display: {
    dateInput: CUSTOM_DISPLAY_DATE_INPUT,
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    LoginRegisterComponent,
    MapComponent,
    RegisterComponent,
    TripInputComponent,
    TripSummaryComponent,
    TripTemplateComponent,
    UiAreaComponent,
    UserProfileComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    NgxSpinnerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    NgxMatTimepickerModule,
    PopoverModule.forRoot(),
    ReactiveFormsModule
  ],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
