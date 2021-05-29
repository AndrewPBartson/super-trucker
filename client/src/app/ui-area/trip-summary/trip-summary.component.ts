import { Component, OnInit, Input } from '@angular/core';
import { ITripObject } from 'src/app/models/itrip-object';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.css']
})
export class TripSummaryComponent implements OnInit {

  @Input() trip: ITripObject;

  showDetails = true;
  panelOpenState: boolean = false;
  allExpandState = false;

  constructor() { }

  ngOnInit() { }
}
