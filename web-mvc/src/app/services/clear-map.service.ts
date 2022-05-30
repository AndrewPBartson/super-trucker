import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClearMapService {

  clearMarkers = new BehaviorSubject<boolean>(true);

  constructor() { }
}
