import { Component, EventEmitter, OnInit, ViewChild, Output, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ControlContainer } from '@angular/forms';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment, MomentFormatSpecification, MomentInput } from 'moment';
const moment = _rollupMoment || _moment;
import { tz } from 'moment-timezone';
import { ThemePalette } from '@angular/material/core';

import { ITripInput } from '../../models/itrip-input';
import { InputService } from '../../services/input.service';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-trip-input',
  templateUrl: './trip-input.component.html',
  styleUrls: ['./trip-input.component.css', './trip-input-grid.component.css'],
  providers: []
})
export class TripInputComponent implements OnInit {
  tripForm: FormGroup;
  advInputVisible = false;
  // for cancelling updating date time field
  intervalId = null;

  @Output() tripSubmitted = new EventEmitter();
  @ViewChild('picker', { static: true }) picker: any;

  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = true;
  public minDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];

  input: ITripInput = {
    origin: '',
    end_point: '',
    miles_per_day: 0,
    avg_speed: null,
    hours_driving: null,
    depart_time: null,
    timezone_user: null,
    time_user_str: null
    //weather: null
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

  selections = [
    tz.guess(), "GMT-0800 (PST)", "GMT-0700 (PDT MST)", "GMT-0600 (MDT CST)", "GMT-0500 (CDT EST)", "GMT-0400 (EDT)"
  ]

  constructor(public inputService: InputService, public viewManagerService: ViewManagerService) { }

  ngOnInit() {

    this.tripForm = new FormGroup({
      weather: new FormControl(true),
      hotels: new FormControl({ value: null, disabled: true }),
      truck_stops: new FormControl({ value: null, disabled: true }),
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
      depart_time: new FormControl(moment().toDate()),
      timezone_user: new FormControl(tz.guess())
    });
    // depart_time is refreshed every 30 seconds but
    // after user sets depart_time manually, it should 
    // not refresh any more 
    // to do: be sure depart_time is never in the past (backend?)
    // 10 minutes = 600000 milliseconds
    this.intervalId = setInterval(this.refreshDateTime, 6000, this.tripForm, 600000);
  }

  refreshDateTime(form, increment) {
    form.get('depart_time').setValue(moment().toDate())
  }

  cancelTimeRefresh() {
    console.log('testing cancel interval')
    clearInterval(this.intervalId)
  }

  onTripSubmitted(e, tForm, presets) {
    this.inputService.adjustFormValues(e, tForm, presets)
    // convert form to clean data
    console.log('onTripSubmitted() - user input :', this.tripForm);
    Object.entries(this.tripForm.value)
      .forEach(([key, inputValue]) => {
        this.input[key] = inputValue;
      });
    // add time string from user's machine
    this.input.time_user_str = this.tripForm.value.depart_time.toString();
    console.log('onTripSubmitted() - fixed input :', this.input);

    this.tripSubmitted.emit(this.input);
    return false;
  }

  showLogin() {
    this.viewManagerService.setViewMode.emit('login')
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
}

// export declare type NgxMatDateFormats = { parse: { dateInput: any; }; display: { dateInput: any; monthYearLabel: any; dateA11yLabel: any; monthYearA11yLabel: any; }; };