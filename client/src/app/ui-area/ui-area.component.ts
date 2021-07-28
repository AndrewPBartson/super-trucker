import { Component, OnInit, Input } from '@angular/core';
import { ITripObject } from 'src/app/models/itrip-object';
import { ApiService } from '../services/api.service';
import { ViewManagerService } from '../services/view-manager.service';
import { trip_I40 } from '../../../../junkyard/data_response_json/test_trip';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  tripObject: ITripObject;
  showForm: boolean;

  constructor(private apiService: ApiService, private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.showForm = true
    this.viewManagerService.toggleView
      .subscribe(status => this.showForm = status);
  }

  doStuffWithRawData(data) {
    let tripData = data.data.trip;
    // let tripData = trip_I40.data.trip;
    console.log('tripData :>> ', tripData);
    return tripData
  }

  callTripService(tripSettings) {
    this.apiService.sendTripRequest(tripSettings)
      .subscribe(rawData => {
        this.tripObject = this.doStuffWithRawData(rawData);
        this.showForm = false;
      })
  }
}
