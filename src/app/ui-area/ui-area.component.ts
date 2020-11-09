import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-ui-area',
  templateUrl: './ui-area.component.html',
  styleUrls: ['./ui-area.component.css']
})
export class UiAreaComponent implements OnInit {
  @Input() enableInput = true;
  @Input() showSummary = false;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    const apiObservable = this.apiService.tellTheOthers();
    apiObservable.subscribe(data => {
      this.doStuffWithData(data);
    });
  }

  onInputSubmitted( newUiSettings: { enableInput: boolean, showSummary: boolean}) {
    this.enableInput = newUiSettings.enableInput;
    this.showSummary = newUiSettings.showSummary;
  }

  doStuffWithData(data) {
    // if request comes back successfully,
    // hide input form and show trip summary with data
    console.log('*****   doStuffWithData() working! ', data);
  }
}
