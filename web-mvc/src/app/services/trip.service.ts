import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITrip } from '../models/itrip';
import { ITripData } from '../models/itrip-data';
import { ITripInput } from '../models/itrip-input';

@Injectable({ providedIn: 'root' })

export class TripService {

  // apiURL: string = 'http://20.124.155.73';
  apiURL: string = 'http://localhost:8880';

  constructor(private httpClient: HttpClient) { }

  tripRequest(tripSettings: ITripInput): Observable<ITrip> {
    return this.httpClient.post<ITrip>(`${this.apiURL}/api/trips`, tripSettings)//.pipe(
    // 
  }
}

  // transformTripData(tripData: ITripData): any {
  //   // let trip = {
  //   //   trip: {
  //   //     ...tripData
  //   //   }
  //   // }
  //   return {
  //     ...tripData
  //     // modify data as needed for the view
  //     // no changes needed, example only
  //     // city: data.cat.city,
  //     // country: data.cat.country,
  //     // owner: data.cat.food_provider,
  //     // color: data.cat.color,
  //     // birthDate: new Date(data.birthDateSec)
  //     //};
  //   }
  // }
