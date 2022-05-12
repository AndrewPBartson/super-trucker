import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PublishService {
  trip = {
    trip: {
      days: [
        {
          time_points: [
            {
              city_state: null,
              miles_today: null,
              hours_today: null,
              time_local: null,
              time_user: null,
              date_local_long: null,
              date_user_long: null,
              status: null,
              temperature: null,
              text: null,
              icon: null
            }
          ]
        }
      ],
      markers: [
        {
          city_state: null,
          lat: null,
          lng: null,
          date: null,
          date_time: null,
          icon: null,
          text: null,
          time: null,
          time_user: null,
          restart: {}
        }
      ],
      overview: {
        origin: null,
        end_point: null,
        summary: null,
        total_mi: null,
        bounds: {
          northeast: { lat: null, lng: null },
          southwest: { lat: null, lng: null }
        }
      }
    }
  }

  transmitData = new BehaviorSubject<any>(this.trip);

  constructor() { }
}
