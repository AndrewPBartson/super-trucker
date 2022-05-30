import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ResizeService } from './services/resize.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  mapSizeFlicker = true;

  constructor(
    private resizeService: ResizeService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.resizeService.notifyResize.subscribe(() => {
      this.mapSizeFlicker = !this.mapSizeFlicker;
      this.mapSizeFlicker = !this.mapSizeFlicker;
    })
  }
}
