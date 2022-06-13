import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RegisterService {
  apiURL: string = 'http://20.124.155.73';

  constructor(private httpClient: HttpClient) { }

  sendRegisterRequest(regInfo): Observable<any> {
    // console.log('register.service - user input ', regInfo);
    return this.httpClient.post(`${this.apiURL}/api/users/register`, regInfo)
  }
}
