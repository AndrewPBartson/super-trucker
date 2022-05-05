import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { ITripObject } from '../models/itrip-object';
import { TripService } from '../services/trip.service';
import { ViewManagerService } from '../services/view-manager.service';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  tripObject: ITripObject;
  viewMode: string;
  setTripData: EventEmitter<string> = new EventEmitter<string>()

  constructor(public tripService: TripService,
    public viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.viewMode = 'form';
    this.viewManagerService.setViewMode
      .subscribe(mode => {
        this.viewMode = mode;
      });
  }

  handleResponse(data) {
    let tripData = data.data.trip;
    console.log('tripData :>> ', tripData);
    this.setTripData.emit(JSON.stringify(tripData));
    // create markers from tripData and load on map
    return tripData
  }

  callTripService(tripSettings) {
    this.tripService.tripRequest(tripSettings)
      .subscribe(rawData => {
        // this.setTripData.emit(JSON.stringify(rawData));
        this.tripObject = this.handleResponse(rawData);
        this.viewMode = 'summary';
      })
  }
}
