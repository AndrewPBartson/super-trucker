import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ILogin } from '../../../models/ilogin';
import { ButtonService } from '../../../services/button.service';
import { ViewManagerService } from '../../../services/view-manager.service';
import isEmpty from '../../../shared/isEmpty';
import setAuthToken from '../../../shared/setAuthToken';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showLoginFailed = false;

  user: ILogin = {
    email: '',
    password: '',
    isAuthenticated: false
  }

  constructor(private loginService: LoginService,
    private buttonService: ButtonService,
    public viewManagerService: ViewManagerService) { }

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
        if (res.token) {
          const token = res.token;
          // save token to localStorage
          localStorage.setItem('jwtToken', token)
          // add token to auth header for all requests
          setAuthToken(token);
          // decode token
          const decoded = jwt_decode(token);
          // if decoded is not empty, set true, else false
          this.user.isAuthenticated = !isEmpty(decoded);
          // show trip form page 
          // todo: trip form shows user's saved trip templates
          this.viewManagerService.setViewMode.emit('form')
          return this.buttonService.loggedIn.next(true);
        }
      },
        (error) => { // login failed 
          this.showLoginFailed = true;
          // todo: provide options: 
          // "Forgot password?" - send link to email address
          // "Create new account" - redirect to Register page
          // "Login as guest" - give temporary access to site
          // with message - "Free access for 10 days or 100 requests"
          // then redirect to "Start New Trip" page 
        })
  }

  logoutUser() {
    this.user.isAuthenticated = false;
    // remove token from localStorage
    localStorage.removeItem('jwtToken');
    // remove token from axios header
    setAuthToken(false);
    return this.buttonService.loggedIn.next(false);
  }
}