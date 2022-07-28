import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RegisterService {

  apiURL: string = 'http://146.190.13.240/';

  constructor(private httpClient: HttpClient) { }

  sendRegisterRequest(regInfo): Observable<any> {
    return this.httpClient.post(`${this.apiURL}/api/users/register`, regInfo)
  }
}
