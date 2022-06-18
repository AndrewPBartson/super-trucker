import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITrip } from '../models/itrip';
import { ITripInput } from '../models/itrip-input';

@Injectable({ providedIn: 'root' })

export class TripService {

  apiURL: string = 'http://20.241.224.46';

  constructor(private httpClient: HttpClient) { }

  tripRequest(tripSettings: ITripInput): Observable<ITrip> {
    return this.httpClient.post<ITrip>(`${this.apiURL}/api/trips`, tripSettings);
  }
}
