import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ILogin } from '../../../models/ilogin';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  viewMode: string;

  user: ILogin = {
    email: '',
    password: ''
  }

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null),
      password: new FormControl(null),
      name: new FormControl(null)
    });
  }

  handleResponse(data) {
    console.log('res to login req :>> ', data);
    return data;
  }

  callLoginService(event) {
    console.log('callLoginService()');
    Object.entries(this.loginForm.value)
      .forEach(([key, inputValue]) => {
        this.user[key] = inputValue;
      });
    this.loginService.sendLoginRequest(this.user)
      .subscribe(incoming => {
        this.user = this.handleResponse(incoming);
        this.viewMode = 'form';
        console.log(`this.user`, this.user)
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
}