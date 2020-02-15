import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputModel } from '../models/input.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiURL: string = 'http://localhost:8001';
  private input: InputModel = {
    origin: '',
    end_point: '',
    miles_per_day: 0
  };

  constructor(private httpClient: HttpClient) {
  }

  getInput() {
    return this.input;
  }

  setInput(input: InputModel) {
  }

  sendTripRequest(tripSettings) {
    console.log('input.service - sendTripRequest() w/ tripSettings :', tripSettings);
    this.httpClient.post(`${ this.apiURL }/trips`, tripSettings)
    .subscribe(response => {
      console.log('response - OMG', response);
      // // if request comes back successfully
      // do stuff
    // // hide input form and show trip summary
    // this.inputSubmitted.emit({
    //   enableInput: false, showSummary: true
    // });
      });
  }
}
