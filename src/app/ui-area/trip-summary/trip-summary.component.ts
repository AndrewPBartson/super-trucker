import { Component, OnInit } from '@angular/core';
import { Leg } from '../../models/Leg';
import { WeatherIcons } from 'src/assets/images/weather_icons';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.css']
})
export class TripSummaryComponent implements OnInit {
  legs: Leg[];
  showDetails = true;

  constructor() { }

 ngOnInit() {
    this.legs = [
      {
        'start_address': {
          'city': 'Bellingham',
          'state': 'WA'
        },
        'end_address': {
          'city': 'Bonner',
          'state': 'MT'
        },
        'duration': {
          'text': '8 hours 37 mins',
          'value': 31036
        },
        'distance': {
          'text': '562 mi',
          'value': 904719
        }
      },
      {
        'start_address': {
          'city': 'Bonner',
          'state': 'MT'
        },
        'end_address': {
          'city': 'Hammond',
          'state': 'MT'
        },
        'duration': {
          'text': '7 hours 56 mins',
          'value': 28565
        },
        'distance': {
          'text': '534 mi',
          'value': 859636
        }
      },
      {
        'start_address': {
          'city': 'Hammond',
          'state': 'MT'
        },
        'end_address': {
          'city': 'Sloan',
          'state': 'IA'
        },
        'duration': {
          'text': '7 hours 59 mins',
          'value': 28720
        },
        'distance': {
          'text': '565 mi',
          'value': 909654
        }
      },
      {
        'start_address': {
          'city': 'Sloan',
          'state': 'IA'
        },
        'end_address': {
          'city': 'Nashville',
          'state': 'IL'
        },
        'duration': {
          'text': '8 hours 3 mins',
          'value': 28986
        },
        'distance': {
          'text': '551 mi',
          'value': 887233
        }
      },
      {
        'start_address': {
          'city': 'Nashville',
          'state': 'IL'
        },
        'end_address': {
          'city': 'Locust Grove',
          'state': 'GA'
        },
        'duration': {
          'text': '7 hours 50 mins',
          'value': 28175
        },
        'distance': {
          'text': '539 mi',
          'value': 868098
        }
      },
      {
        'start_address': {
          'city': 'Locust Grove',
          'state': 'GA'
        },
        'end_address': {
          'city': 'West Palm Beach',
          'state': 'FL'
        },
        'duration': {
          'text': '7 hours 45 mins',
          'value': 27897
        },
        'distance': {
          'text': '560 mi',
          'value': 900702
        }
      },
      {
        'start_address': {
          'city': 'West Palm Beach',
          'state': 'FL'
        },
        'end_address': {
          'city': 'Hialeah',
          'state': 'FL'
        },
        'duration': {
          'text': '1 hour 7 mins',
          'value': 3993
        },
        'distance': {
          'text': '63.7 mi',
          'value': 102533
        }
      },
      {
        'start_address': {
          'city': 'Hialeah',
          'state': 'FL'
        },
        'end_address': {
          'city': '',
          'state': ''
        },
        'duration': {
          'text': '',
          'value': 0
        },
        'distance': {
          'text': '',
          'value': 0
        }
      }
    ],
    this.legs.forEach(leg => {
      // this.tempObj = WeatherIcons.getIcons();
      // console.log(this.tempObj[0]);
      // leg.image = 'http://lorempixel.com/50/58';
    });
  }

}
