import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment, MomentFormatSpecification, MomentInput } from 'moment';
const moment = _rollupMoment || _moment;

@Injectable({
  providedIn: 'root'
})
export class InputService {

  constructor() { }

  checkCityName(control: FormControl): { [s: string]: true } {
    let isCityInvalid = false;
    let item;
    if (control.value) {
      if (control.value.length < 2) {
        isCityInvalid = true;
      } else {
        for (let i = 0, len = control.value.length; i < len; i++) {
          item = control.value.charCodeAt(i);
          if (!(item > 64 && item < 91) && // upper alpha (A-Z)
            !(item > 96 && item < 123) && // lower alpha (a-z)
            !(item === 32) && // allow space
            !(item === 44) && // allow comma
            !(item === 45)) { // allow dash
            isCityInvalid = true;
          }
        }
      }
    }
    return isCityInvalid ? { 'cityIsInvalid': true } : null;
  }

  checkMilesPerDay(control: FormControl): { [s: string]: true } {
    let min = 100;
    let errorCode = '';
    let isDataInvalid = false;
    if (control.value && control.value < min) {
      errorCode = 'milesLessThanMin';
      isDataInvalid = true;
    }
    return isDataInvalid ? { errorCode: true } : null;
  }

  adjustSpeedMiHrs(e, tForm, presets) {
    tForm.value.miles_per_day = Math.abs(tForm.value.miles_per_day);
    tForm.value.hours_driving = Math.abs(tForm.value.hours_driving);
    tForm.value.avg_speed = Math.abs(tForm.value.avg_speed);

    let trick = 0;
    if (!!tForm.value.miles_per_day) { trick += 1; }
    if (!!tForm.value.hours_driving) { trick += 2; }
    if (!!tForm.value.avg_speed) { trick += 4; }

    let miTemp = 0;
    let hrsTemp = 0;
    let spdTemp = 0;

    switch (trick) {
      case 0: // no values present
        miTemp = presets.average.miles_per_day;
        hrsTemp = presets.average.hours_driving;
        spdTemp = presets.average.avg_speed;
        break;
      case 1: // user input - miles_per_day
        miTemp = Math.ceil(tForm.value.miles_per_day);
        if (miTemp > 2472) {
          miTemp = 2472;
        }
        spdTemp = presets.average.avg_speed;
        hrsTemp = (Math.round((miTemp / spdTemp) / 0.25)) * 0.25;
        // if hrsTemp > 24, reduce hours and increase speed
        if (hrsTemp > 24) {
          hrsTemp = 24;
          spdTemp = Math.round(miTemp / hrsTemp);
        }
        break;
      case 2: // input - hours_driving
        hrsTemp = (Math.round((tForm.value.hours_driving) / 0.25)) * 0.25;
        if (hrsTemp > 24) {
          hrsTemp = 24;
        }
        spdTemp = presets.average.avg_speed;
        miTemp = Math.ceil(spdTemp * hrsTemp);
        break;
      case 3: // input - miles_per_day, hours_driving
        // console.log('THIS NEVER HAPPENS - case 3');
        miTemp = Math.ceil(tForm.value.miles_per_day);
        if (miTemp > 2472) {
          miTemp = 2472;
        }
        hrsTemp = (Math.round((tForm.value.hours_driving) / 0.25)) * 0.25;
        if (hrsTemp > 24) {
          hrsTemp = 24;
        }
        spdTemp = Math.round(miTemp / hrsTemp);
        break;
      case 4: // input - avg_speed
        spdTemp = Math.round(tForm.value.avg_speed);
        if (spdTemp > 103) {
          spdTemp = 103;
        }
        hrsTemp = presets.average.hours_driving;
        miTemp = Math.ceil(spdTemp * hrsTemp);
        break;
      case 5: // input - miles_per_day, avg_speed
        // console.log('THIS NEVER HAPPENS - case 5');
        miTemp = Math.ceil(tForm.value.miles_per_day);
        spdTemp = Math.round(tForm.value.avg_speed);
        hrsTemp = (Math.round((miTemp / spdTemp) / 0.25)) * 0.25;
        break;
      case 6: // input - hours_driving, avg_speed
        // console.log('THIS NEVER HAPPENS - case 6');
        hrsTemp = (Math.round((tForm.value.hours_driving) / 0.25)) * 0.25;
        spdTemp = Math.round(tForm.value.avg_speed);
        miTemp = Math.ceil(hrsTemp * spdTemp);
        break;
      case 7: // input - all values present
        spdTemp = Math.round(tForm.value.avg_speed);
        if (spdTemp > 103) {
          spdTemp = 103;
        }
        // Corner case - when last value changed is "miles_per_day", recalc hours
        if (e.target.id === 'miles_per_day') {
          miTemp = Math.ceil(tForm.value.miles_per_day);
          if (miTemp > 2472) {
            miTemp = 2472;
          }
          hrsTemp = (Math.round((miTemp / spdTemp) / 0.25)) * 0.25;
          if (hrsTemp > 24) {
            hrsTemp = 24;
            miTemp = Math.ceil(hrsTemp * spdTemp);
          }
        }
        else {
          hrsTemp = (Math.round((tForm.value.hours_driving) / 0.25)) * 0.25;
          if (hrsTemp > 24) {
            hrsTemp = 24;
          }
          miTemp = Math.ceil(hrsTemp * spdTemp);
        }
        break;
    }
    tForm.patchValue({
      miles_per_day: miTemp,
      hours_driving: hrsTemp,
      avg_speed: spdTemp
    });
    return;
  }

  formatISOString(string) {
    return string.slice(0, 10) + ' ' + string.slice(11, 19)
  }

  buildRequestData(tripForm, reqData) {
    Object.entries(tripForm.value)
      .forEach(([key, inputValue]) => {
        reqData[key] = inputValue;
      });

    // depart_msec_browser =
    // timestamp from date/time picker which is hardwired to assume browser timezone
    let depart_msec_browser = moment(tripForm.value.depart_time).valueOf();
    // depart_str = string representation of this timestamp that's
    // formatted so as to exclude timezone information
    let depart_str = moment(depart_msec_browser).format("YYYY-MM-DD HH:mm:ss")
    // depart_obj =
    // new moment object created from depart_str, and passing in timezone_city from html form
    let depart_obj = moment.tz(depart_str, reqData.timezone_city);
    // pull out timestamp for depart time
    reqData.depart_time_msec = depart_obj.valueOf();
    // convert this moment object to beginning of day in timezone_city and
    // pull out timestamp for beginning of day
    let midnight_prev = depart_obj.startOf('day').valueOf()
    // calculate timestamp for beginning of next day (next midnight)
    let midnight = midnight_prev + 86400000
    reqData.midnight_msec = midnight;
    delete reqData.depart_time;

    return reqData;
  }
}
