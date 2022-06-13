import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ButtonService {

  loggedIn = new BehaviorSubject<boolean>(true);

  constructor() { }
}
