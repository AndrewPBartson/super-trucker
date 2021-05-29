import { Component, OnInit, Input } from '@angular/core';
import { ITripObject } from 'src/app/models/itrip-object';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  tripObject: ITripObject;

  constructor(private apiService: ApiService) { }

  ngOnInit() { }

  fixRawData(data) {
    let tripData = data.data.trip;
    console.log(`tripData`, tripData)
    return tripData
  }

  callTripService(tripSettings) {
    this.apiService.sendTripRequest(tripSettings)
      .subscribe(rawData => {
        this.tripObject = this.fixRawData(rawData);
      })
  }
}
