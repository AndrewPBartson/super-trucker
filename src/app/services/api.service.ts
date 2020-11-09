import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputModel } from '../models/input.model';
import { Observable } from 'rxjs';
// import { inputSubmitted } from '../ui-area/trip-input/trip-input.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiURL: string = 'http://localhost:3001';
  football: {};

  private input: InputModel = {
    origin: '',
    end_point: '',
    miles_per_day: 0
  };

  constructor(private httpClient: HttpClient) { }

  getInput() {
    return this.input;
  }

  setInput(input: InputModel) {
  }

  sendTripRequest(tripSettings) {
    console.log('input.service - sendTripRequest() w/ tripSettings :', tripSettings);
    this.httpClient.post(`${this.apiURL}/trips`, tripSettings)
      .subscribe(value => {
        this.football = value;
        console.log('response! OMG!', value);
        const x = this.tellTheOthers();
        console.log('*****   Observer threw football! ', this.football);
        console.log('*****   x! ', x);
        return x;
      }, err => {
        console.log('Observer got an error: ' + err)
      }, () => {
        console.log('Observer is complete!');
      });
  }
  tellTheOthers() {
    const hailMary = new Observable(observer => {
      console.log('*****   api.service.tellTheOthers()');
      observer.next(this.football);
    });
    return hailMary;
  }
}
