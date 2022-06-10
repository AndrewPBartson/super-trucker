import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment, MomentFormatSpecification, MomentInput } from 'moment';
const moment = _rollupMoment || _moment;
import { tz } from 'moment-timezone';
import { ThemePalette } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { ClearMapService } from '../../services/clear-map.service';
import { InputService } from '../../services/input.service';
import { ITripInput } from '../../models/itrip-input';
import { PublishService } from '../../services/publish.service';
import { TripService } from '../../services/trip.service';
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

  // create property for user input for trip request
  input: ITripInput = {
    avg_speed: null,
    depart_time: null,
    depart_time_msec: 0,
    end_point: '',
    hours_driving: null,
    miles_per_day: 0,
    origin: '',
    time_user_str: null,
    timezone_user: null
    //weather: null
  };

  presets = {
    trucker: {
      avg_speed: 62,
      hours_driving: 11,
      miles_per_day: 682
    },
    average: {
      avg_speed: 50,
      hours_driving: 10.2,
      miles_per_day: 510
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

  constructor(
    private clearMapService: ClearMapService,
    private inputService: InputService,
    private publishService: PublishService,
    private tripService: TripService,
    private viewManagerService: ViewManagerService,
    private spinner: NgxSpinnerService) { }

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
    // backend prevents trips from beginning in the past

    // 10 minutes = 600000 milliseconds
    this.intervalId = setInterval(this.refreshDateTime, 6000, this.tripForm, 600000);
  }

  onTripSubmitted(e, tForm, presets) {
    this.showSpinner();
    this.refreshMap();
    this.inputService.adjustFormValues(e, tForm, presets)
    this.inputService.buildRequestData(tForm, this.input)
    console.log('onTripSubmitted() - user input :>> ', this.input);

    this.tripService.tripRequest(this.input)
      .subscribe(data => {
        this.hideSpinner();
        this.viewManagerService.setViewMode.emit('summary')
        return this.publishService.transmitData.next(data);
      })
    return false;
  }

  showSpinner() {
    this.spinner.show();
  }

  hideSpinner() {
    this.spinner.hide();
  }

  refreshDateTime(form) {
    form.get('depart_time').setValue(moment().toDate())
  }

  refreshMap() {
    return this.clearMapService.clearMarkers.next(true);
  }

  cancelTimeRefresh() {
    clearInterval(this.intervalId)
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
