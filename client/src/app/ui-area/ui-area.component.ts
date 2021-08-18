import { Component, OnInit, Input } from '@angular/core';
import { ITripObject } from '../models/itrip-object';
import { ApiService } from '../services/api.service';
import { ViewManagerService } from '../services/view-manager.service';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  tripObject: ITripObject;
  viewMode: string;

  constructor(private apiService: ApiService, private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.viewMode = 'form'
    this.viewManagerService.setViewMode
      .subscribe(mode => {
        this.viewMode = mode
      });
  }

  handleResponse(data) {
    let tripData = data.data.trip;
    // let tripData = trip_I40.data.trip;
    console.log('tripData :>> ', tripData);
    return tripData
  }

  callTripService(tripSettings) {
    this.apiService.sendTripRequest(tripSettings)
      .subscribe(rawData => {
        this.tripObject = this.handleResponse(rawData);
        this.viewMode = 'summary';
      })
  }
}
