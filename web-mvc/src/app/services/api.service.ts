import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { InputModel } from '../models/input.model';
import { Observable } from 'rxjs';
import { ITripObject } from '../models/itrip-object';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // apiURL: string = 'http://20.124.155.73';
  apiURL: string = 'http://localhost:8880';
  football: {};

  /* private input: InputModel = {
    origin: '',
    end_point: '',
    miles_per_day: 0,
    timezone_user: '',
    time_user_str: ''
  }; */

  constructor(private httpClient: HttpClient) { }

  sendTripRequest(tripSettings): Observable<ITripObject> {
    console.log('api.service - sendTripRequest() w/ tripSettings :', tripSettings);
    return this.httpClient.post(`${this.apiURL}/api/trips`, tripSettings)
  }
}
