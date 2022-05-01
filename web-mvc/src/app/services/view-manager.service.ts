import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewManagerService {

  constructor() { }

  setViewMode: EventEmitter<string> = new EventEmitter<string>()
}
