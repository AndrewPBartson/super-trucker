import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  apiURL: string = 'http://20.124.155.73';

  constructor(private httpClient: HttpClient) { }

  sendLoginRequest(loginInfo): Observable<any> {
    // console.log('login.service - user input ', loginInfo);
    return this.httpClient.post(`${this.apiURL}/api/users/login`, loginInfo)
  }
}
