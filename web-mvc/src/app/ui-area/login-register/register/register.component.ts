import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { RegisterService } from '../../../services/register.service';
import { IRegister } from '../../../models/iregister';
import { ViewManagerService } from '../../../services/view-manager.service';
import isEmpty from '../../../shared/isEmpty';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  showRegisterFailed = false;

  newUser: IRegister = {
    name: '',
    email: '',
    password: '',
    password2: '',
    _id: ''
  }

  constructor(private registerService: RegisterService,
    public viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl(null),
      email: new FormControl(null),
      password: new FormControl(null),
      password2: new FormControl(null)
    });
  }

  handleResponse = (data) => {
    return data;
  }

  registerUser(event) {
    Object.entries(this.registerForm.value)
      .forEach(([key, inputValue]) => {
        this.newUser[key] = inputValue;
      });
    this.registerService.sendRegisterRequest(this.newUser)
      .subscribe(res => {
        if (res._id) {
          console.log(`New user registered `, this.newUser)
          this.newUser = this.handleResponse(res);

          this.viewManagerService.setViewMode.emit('form')
        } else {
          console.log("Server did not return an id");
        }
      },
        (error) => { // Register failed 
          this.showRegisterFailed = true;
        })
  }
}
