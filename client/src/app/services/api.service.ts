import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputModel } from '../models/input.model';
import { Observable } from 'rxjs';
import { ITripObject } from 'src/app/models/itrip-object';
// import { inputSubmitted } from '../ui-area/trip-input/trip-input.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiURL: string = 'http://localhost:8880';
  football: {};

  private input: InputModel = {
    origin: '',
    end_point: '',
    miles_per_day: 0,
    timezone_user: '',
    time_user_str: ''
  };

  constructor(private httpClient: HttpClient) { }

  getInput() {
    return this.input;
  }

  setInput(input: InputModel) {
  }

  sendTripRequest(tripSettings): Observable<ITripObject> {
    console.log('api.service - sendTripRequest() w/ tripSettings :', tripSettings);
    return this.httpClient.post(`${this.apiURL}/api/trips`, tripSettings)
    // .subscribe(value => {
    //   console.log('response! OMG!', value);
    // }, err => {
    //   console.log('Observer got an error: ' + err)
    // }, () => {
    //   console.log('Observer is complete!');
    // });
  }

}
