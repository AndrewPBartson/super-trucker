import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILogin } from '../models/ilogin';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  apiURL: string = 'http://localhost:8880';
  football: {};

  private user: ILogin = {
    email: '',
    password: ''
  }

  constructor(private httpClient: HttpClient) { }

  sendLoginRequest(loginInfo): Observable<ILogin> {
    console.log('login.service - send req w/ loginInfo :', loginInfo);
    return this.httpClient.post(`${this.apiURL}/api/users/login`, loginInfo)
  }
}
