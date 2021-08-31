import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ILogin } from '../../../models/ilogin';
import { ViewManagerService } from '../../../services/view-manager.service';
import setAuthToken from '../../../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  user: ILogin = {
    email: '',
    password: '',
    isAuthenticated: false
  }

  constructor(private loginService: LoginService, private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null),
      password: new FormControl(null),
      name: new FormControl(null)
    });
  }

  showForm() {
    this.viewManagerService.setViewMode.emit('form')
  }

  loginUser(event) {
    Object.entries(this.loginForm.value)
      .forEach(([key, inputValue]) => {
        this.user[key] = inputValue;
      });
    this.loginService.sendLoginRequest(this.user)
      .subscribe(res => {
        console.log(`res`, res)
        const token = res.token;
        // save token to localStorage
        localStorage.setItem('jwtToken', token)
        // add token to auth header for all requests
        setAuthToken(token);
        // decode token
        const decoded = jwt_decode(token);
        console.log(`decoded ->  `, decoded)
        this.user.isAuthenticated = true;

        // if decoded is not empty, set true, else false
        // isAuthenticated: !isEmpty(action.payload),
        //   user: action.payload


        this.viewManagerService.setViewMode.emit('form')
        console.log(`this.user has token - `, this.user)

        // if login was success
        // show trip form page including user's saved trip templates
        // else 
        // provide options: 
        // "Forgot password?" - send link to email address
        // "Create new account" - redirect to Register page
        // "Login as guest" - give temporary access to site
        // with message - "Free access for 10 days or 100 requests"
        // then redirect to "Start New Trip" page 
      })
  }
  logoutUser() {
    // remove token from localStorage
    localStorage.removeItem('jwtToken');
    // remove token from axios header
    setAuthToken(false);
  }
}