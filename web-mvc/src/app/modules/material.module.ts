import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatListModule,
  MatNativeDateModule,
  MatTabsModule
} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';


const material = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatTabsModule,
  MatRadioModule,
  MatSliderModule
]

@NgModule({
  imports: [material],
  exports: [material]
})

export class MaterialModule { }
