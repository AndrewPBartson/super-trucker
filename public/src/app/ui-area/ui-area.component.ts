import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  @Input() enableInput = true;
  @Input() showSummary = false;

  constructor() { }

  ngOnInit() {
  }

  onInputSubmitted( newUiSettings: { enableInput: boolean, showSummary: boolean}) {
    this.enableInput = newUiSettings.enableInput;
    this.showSummary = newUiSettings.showSummary;
  }
}
