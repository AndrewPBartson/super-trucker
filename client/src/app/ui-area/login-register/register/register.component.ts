import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { RegisterService } from '../../../services/register.service';
import { IRegister } from '../../../models/iregister';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  newUser: IRegister = {
    name: '',
    email: '',
    password: '',
    password2: ''
  }

  constructor(private registerService: RegisterService) { }

  ngOnInit() {
    console.log('test register')
    this.registerForm = new FormGroup({
      name: new FormControl(null),
      email: new FormControl(null),
      password: new FormControl(null),
      password2: new FormControl(null)
    });
  }

  handleResponse = (data) => {
    console.log('res to register req :>> ', data);
    return data;
  }

  registerUser(event) {
    Object.entries(this.registerForm.value)
      .forEach(([key, inputValue]) => {
        this.newUser[key] = inputValue;
      });
    this.registerService.sendRegisterRequest(this.newUser)
      .subscribe(incoming => {
        this.newUser = this.handleResponse(incoming);
        // this.viewMode = 'form';
        console.log(`register this.newUser`, this.newUser)
        // if login was success
        // show newUser's saved trip templates
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
