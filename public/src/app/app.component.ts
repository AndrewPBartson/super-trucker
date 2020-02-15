import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'SuperTrucker';
  zoom: number = 12;
  lat: number = 55.475732;
  lng: number = -133.145881;
  options: any[] = [
    { featureType: 'poi.business',
      stylers: [ { visibility: 'off' } ]
    },
    { featureType: 'poi.park',
      elementType: 'labels.text',
      stylers: [ { visibility: 'off' } ]
    },
    { featureType: 'road',
      elementType: 'geometry',
      stylers: [ { color: '#f5f1e6' } ]
    },
    { featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [ { color: '#fdfcf8' } ]
    },
    { featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [ { color: '#0EFDAA' } ]
    },
    { featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [ { color: '#008B2D' } ]
    },
    { featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [ { color: '#0EFDAA' } ]
    },
    { featureType: 'road.highway.controlled_access',
      elementType: 'geometry.stroke',
      stylers: [ { color: '#008B2D' } ]
    },
    { featureType: 'road.local',
      elementType: 'labels',
      stylers: [ { visibility: 'off' } ]
    },
    { featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [ { color: '#c4deFF' } ]
    }
  ];
}
