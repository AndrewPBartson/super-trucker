import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewManagerService {

  constructor() { }

  toggleView: EventEmitter<boolean> = new EventEmitter<boolean>()
}
