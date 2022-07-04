import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  apiURL: string = 'http://20.124.158.218';

  constructor(private httpClient: HttpClient) { }

  sendLoginRequest(loginInfo): Observable<any> {
    return this.httpClient.post(`${this.apiURL}/api/users/login`, loginInfo)
  }
}
