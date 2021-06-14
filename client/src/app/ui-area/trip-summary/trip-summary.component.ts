import { Component, OnInit, Input } from '@angular/core';
import { ITripObject } from 'src/app/models/itrip-object';
import { ViewManagerService } from '../../services/view-manager.service';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.css']
})
export class TripSummaryComponent implements OnInit {

  @Input() trip: ITripObject;
  isVisible: boolean;

  showDetails = true;
  panelOpenState: boolean = false;
  allExpandState = false;

  constructor(private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.isVisible = false;
  }

  toggleUI() {
    this.viewManagerService.toggleView.emit(!this.isVisible)
  }
}
