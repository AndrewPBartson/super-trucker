import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './modules/app-routing.module';
import { MaterialModule } from './modules/material.module';
// why is popover installed? what is ngx-bootstrap?
import { PopoverModule } from 'ngx-bootstrap/popover';

import { AppComponent } from './app.component';
import { UiAreaComponent } from './ui-area/ui-area.component';
import { HeaderComponent } from './ui-area/header/header.component';
import { TripInputComponent } from './ui-area/trip-input/trip-input.component';
import { TripSummaryComponent } from './ui-area/trip-summary/trip-summary.component';
import { LoginRegisterComponent } from './ui-area/login-register/login-register.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './ui-area/login-register/login/login.component';
import { RegisterComponent } from './ui-area/login-register/register/register.component';

import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
  NgxMatDateFormats,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { TripTemplateComponent } from './ui-area/trip-template/trip-template.component';
import { UserProfileComponent } from './ui-area/user-profile/user-profile.component';

const CUSTOM_PARSE_DATE_INPUT = 'l, LTS';
const CUSTOM_DISPLAY_DATE_INPUT = 'ddd MM/DD - hh:mm a';

// If using Moment
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
    TripInputComponent,
    UiAreaComponent,
    HeaderComponent,
    TripSummaryComponent,
    LoginRegisterComponent,
    LoginComponent,
    RegisterComponent,
    TripTemplateComponent,
    UserProfileComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: environment.gmKey
    }),
    PopoverModule.forRoot(),
    BrowserAnimationsModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    NgxMatTimepickerModule,
    MaterialModule
  ],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
