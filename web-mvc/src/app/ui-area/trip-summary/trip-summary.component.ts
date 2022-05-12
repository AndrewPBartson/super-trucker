import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from '../../services/view-manager.service';
import { PublishService } from '../../services/publish.service';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.css']
})
export class TripSummaryComponent implements OnInit {

  data: any; // html is bound to this.data
  showDetails = true;
  panelOpenState: boolean = false;
  allExpandState = false;

  constructor(
    private viewManagerService: ViewManagerService,
    private publishService: PublishService) { }


  ngOnInit() {
    this.publishService.transmitData.subscribe(trip => {
      console.log('data to UI :>> ', trip);
      this.data = trip;
    })
  }

  showForm(): void {
    this.viewManagerService.setViewMode.emit('form')
  }
}
