import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITrip } from '../models/itrip';
import { ITripInput } from '../models/itrip-input';

@Injectable({ providedIn: 'root' })

export class TripService {

  apiURL: string = 'http://20.124.158.218';

  constructor(private httpClient: HttpClient) { }

  tripRequest(tripSettings: ITripInput): Observable<ITrip> {
    console.log(`req.body ->`, tripSettings)
    return this.httpClient.post<ITrip>(`${this.apiURL}/api/trips`, tripSettings);
  }
}
