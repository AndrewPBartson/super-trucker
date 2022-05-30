import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from '../services/view-manager.service';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})

export class UiAreaComponent implements OnInit {
  viewMode: string;

  constructor(
    private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.viewMode = 'form';
    this.viewManagerService.setViewMode
      .subscribe(mode => {
        this.viewMode = mode;
      });
  }
}
