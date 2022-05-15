import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from '../../services/view-manager.service';
import { PublishService } from '../../services/publish.service';
import { ResizeService } from '../../services/resize.service';

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
    private publishService: PublishService,
    private resizeService: ResizeService) { }


  ngOnInit() {
    this.publishService.transmitData.subscribe(trip => {
      this.data = trip;
    })
  }

  showForm(): void {
    this.viewManagerService.setViewMode.emit('form')
  }

  changeCollapseStatus() {
    this.allExpandState = !this.allExpandState;
    return this.resizeService.notifyResize.next(true);
  }
}
