import { Component, OnInit, Input } from '@angular/core';
import { ButtonService } from '../../services/button.service';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  @Input() btn_status: { type: string, name: string, content: string };

  isLoggedIn = false;

  constructor(
    private viewManagerService: ViewManagerService,
    private buttonService: ButtonService,) { }

  ngOnInit() {
    this.buttonService.loggedIn.subscribe(loginStatus => {
      this.isLoggedIn = loginStatus;
    })
  }

  showLogin() {
    this.viewManagerService.setViewMode.emit('login')
  }

  logout() {
    this.viewManagerService.setViewMode.emit('login');
    return this.buttonService.loggedIn.next(false);
  }

  showForm() {
    this.viewManagerService.setViewMode.emit('form')
  }
}
