import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-trip-template',
  templateUrl: './trip-template.component.html',
  styleUrls: ['./trip-template.component.css']
})
export class TripTemplateComponent implements OnInit {

  constructor(public viewManagerService: ViewManagerService) { }

  ngOnInit() {
  }
}
