import { Component, OnInit } from '@angular/core';
import { PublishService } from '../../services/publish.service';
import { ResizeService } from '../../services/resize.service';
import { ButtonService } from '../../services/button.service';
import { ViewManagerService } from '../../services/view-manager.service';

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
  isLoggedIn = false;

  constructor(
    private publishService: PublishService,
    private resizeService: ResizeService,
    private buttonService: ButtonService,
    private viewManagerService: ViewManagerService) { }

  ngOnInit() {
    this.publishService.transmitData.subscribe(trip => {
      this.data = trip;
    })
    this.buttonService.loggedIn.subscribe(loginStatus => {
      this.isLoggedIn = loginStatus;
    })
  }

  showForm(): void {
    this.viewManagerService.setViewMode.emit('form')
  }

  logout() {
    this.viewManagerService.setViewMode.emit('login');
    return this.buttonService.loggedIn.next(false);
  }

  changeCollapseStatus() {
    this.allExpandState = !this.allExpandState;
    return this.resizeService.notifyResize.next(true);
  }
}
