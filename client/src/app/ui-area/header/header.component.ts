import { Component, OnInit, Input } from '@angular/core';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  @Input() view_status: { type: string, name: string, content: string };

  constructor(private viewManagerService: ViewManagerService) { }

  ngOnInit() {
  }

  showLogin() {
    this.viewManagerService.setViewMode.emit('login')
  }

  showForm() {
    this.viewManagerService.setViewMode.emit('form')
  }
}
