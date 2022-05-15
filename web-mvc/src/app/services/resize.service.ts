import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {

  notifyResize = new BehaviorSubject<boolean>(true);

  constructor() { }
}
