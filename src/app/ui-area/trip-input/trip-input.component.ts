import { Component, EventEmitter, OnInit, ViewChild, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, ControlContainer } from '@angular/forms';

import { InputModel } from '../../models/input.model';
import { ApiService } from '../../services/api.service';
import { InputService } from '../../services/input.service';
import * as _moment from 'moment';
// import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
// import { MomentDateTimeAdapter } from 'ng-pick-datetime-moment';

// const moment = (_moment as any).default ? (_moment as any).default : _moment;

// export const MY_CUSTOM_FORMATS = {
//   parseInput: 'LL LT',
//   fullPickerInput: 'LL LT',
//   datePickerInput: 'LL',
//   timePickerInput: 'LT',
//   monthYearLabel: 'MMM YYYY',
//   dateA11yLabel: 'LL',
//   monthYearA11yLabel: 'MMMM YYYY',
// };

@Component({
  selector: 'app-trip-input',
  templateUrl: './trip-input.component.html',
  styleUrls: ['./trip-input.component.css', './trip-input-grid.component.css'],
  providers: [
    // {
    //   provide: DateTimeAdapter,
    //   // useClass: MomentDateTimeAdapter,
    //   deps: [OWL_DATE_TIME_LOCALE]
    // },
    // {
    //   provide: OWL_DATE_TIME_FORMATS,
    //   useValue: MY_CUSTOM_FORMATS
    // },
  ]
})
export class TripInputComponent implements OnInit {
  @Output() inputSubmitted = new EventEmitter<{
    enableInput: boolean,
    showSummary: boolean
  }>();

  currentTime = new Date();
  // public dateTime = new moment();
  advInputVisible = false;

  tripForm: FormGroup;
  input: InputModel = {
    origin: '',
    end_point: '',
    miles_per_day: 0,
    avg_speed: null,
    hours_driving: null,
    depart_time: null
  };

  presets = {
    trucker: {
      avg_speed: 62,
      hours_driving: 11,
      miles_per_day: 682
    },
    average: {
      avg_speed: 65,
      hours_driving: 6,
      miles_per_day: 390
    },
    fast: {
      avg_speed: 75,
      hours_driving: 12,
      miles_per_day: 900
    }
  };

  // should the service (injected) be private?
  constructor(public apiService: ApiService, public inputService: InputService) { }

  ngOnInit() {
    this.tripForm = new FormGroup({
      weather: new FormControl(true),
      hotels: new FormControl(null),
      truck_stops: new FormControl(null),
      origin: new FormControl('', [
        Validators.required,
        this.inputService.checkCityName.bind(this)
      ]),
      end_point: new FormControl('', [
        Validators.required,
        this.inputService.checkCityName.bind(this)
      ]),
      miles_per_day: new FormControl(null, [
        this.inputService.checkMilesPerDay
      ]),
      avg_speed: new FormControl(null),
      hours_driving: new FormControl(null),
      depart_time: new FormControl(new Date()),
    });
  }
  onGetRoute() {
    console.log('onGetRoute() - this.tripForm :', this.tripForm);
    Object.entries(this.tripForm.value)
      .forEach(([key, inputValue]) => {
        this.input[key] = inputValue;
      });
    this.apiService.sendTripRequest(this.input);
  }
  showMoreLess() {
    if (!this.advInputVisible) {
      this.advInputVisible = true;
    } else {
      this.advInputVisible = false;
    }
  }
  useQuickPick(selection) {
    this.tripForm.patchValue({
      miles_per_day: selection.miles_per_day,
      hours_driving: selection.hours_driving,
      avg_speed: selection.avg_speed
    });
  }
  tempTest(message) {
    console.log(message);
  }
}
