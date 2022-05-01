import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRegister } from '../models/iregister';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  apiURL: string = 'http://20.124.155.73';

  private user: IRegister = {
    name: '',
    email: '',
    password: '',
    password2: ''
  }

  constructor(private httpClient: HttpClient) { }

  sendRegisterRequest(regInfo): Observable<IRegister> {
    console.log('register.service - send req w/ regInfo :', regInfo);
    return this.httpClient.post(`${this.apiURL}/api/users/register`, regInfo)
  }
}
