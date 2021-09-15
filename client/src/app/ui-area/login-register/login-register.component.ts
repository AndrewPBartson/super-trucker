import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements OnInit {
  @Input() view_status: { type: string, name: string, content: string };

  constructor(public viewManagerService: ViewManagerService) { }

  ngOnInit() {
  }
}
