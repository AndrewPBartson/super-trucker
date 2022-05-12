import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PublishService } from './services/publish.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title: string = 'SuperTrucker';
  private _gmap: ElementRef;

  @ViewChild("mapContainer", { static: false }) get gmap(): ElementRef { return this._gmap; }
  set gmap(newValue: ElementRef) {
    if (this._gmap !== newValue) {
      this._gmap = newValue;
    }
  }
  map: google.maps.Map;
  lat: number = 39.33031793760815;
  lng: number = -102.07816172050742;
  coordinates = new google.maps.LatLng(this.lat, this.lng);
  data: any;

  markers = [];

  constructor(private publishService: PublishService) { }

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 5,
  };

  ngAfterViewInit() {
    this.mapInitializer();
    this.publishService.transmitData.subscribe(data => {
      this.mapInitializer();
      console.log('data for map :>> ', data);
      this.data = data;
      this.setMapBounds(data)
      this.addPolyline(data.trip.polyline);
      this.createMarkerArr(this.buildMarkerData(data));
      this.showMainInfoWindows([1]);
    })
    let bounds = new google.maps.LatLngBounds();
    // open map with view of middle of USA -
    bounds.extend(new google.maps.LatLng(45.6, -81.0));
    bounds.extend(new google.maps.LatLng(30.6, -117.0));
    this.map.fitBounds(bounds)
  }

  mapInitializer() {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.markers = [];
  }

  buildMarkerData(data): any[] {
    let smallIcon, newMarker, restartInfo, dayIndex = 0;
    let prelim_markers = [];
    for (let i = 0; i < data.trip.markers.length; i++) {
      smallIcon = {
        url: data.trip.markers[i].icon,
        scaledSize: new google.maps.Size(50, 50)
      }
      newMarker = {
        position: new google.maps.LatLng(data.trip.markers[i].lat, data.trip.markers[i].lng),
        map: this.map,
        title: data.trip.markers[i].city_state,
        city_state: data.trip.markers[i].city_state,
        dayIndex: dayIndex,
        date: data.trip.markers[i].date,
        time: data.trip.markers[i].time,
        time_user: data.trip.markers[i].time_user,
        text: data.trip.markers[i].text,
        icon: {},
        icon_url: data.trip.markers[i].icon,
        restart: null
      };
      if (data.trip.markers[i].restart_data) {
        dayIndex++;
        restartInfo = {
          date_2: data.trip.markers[i].restart_data.date,
          time_2: data.trip.markers[i].restart_data.time,
          time_user_2: data.trip.markers[i].restart_data.time_user,
          text_2: data.trip.markers[i].restart_data.text,
          icon_url_2: data.trip.markers[i].restart_data.icon,
        }
        newMarker.restart = restartInfo;
      }
      // icon is assigned separately from other properties just so
      // minor error in devtools console goes away :) 
      newMarker.icon = smallIcon;
      prelim_markers.push(newMarker);
    }
    return prelim_markers;
  }

  createMarkerArr(incoming): void {
    console.log(`prelim_markers`, incoming)

    incoming.forEach((markerData, idx) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        /*
          following line causes minor error in devtools console
          but ignore error for sake of better visual experience
        */
        icon: markerData.icon,
        title: markerData.title
      });

      let infoContent = this.createInfoHtml(markerData);
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });

      marker.addListener("click", () => {
        infoWindow.open(marker.getMap(), marker);
      });
      marker.setMap(this.map);
      this.markers.push(marker);
    });
  }

  showMainInfoWindows(markerIds): void {
    for (let i = 0; i < markerIds.length; i++) {
      if (this.markers[markerIds[i]] && this.markers[markerIds[i]].icon) {
        console.log(`this.markers[markerIds[i]]`, this.markers[markerIds[i]])
        google.maps.event.trigger(this.markers[markerIds[i]], 'click');
      }
    }
  }

  setMapBounds(data): void {
    let bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(
      data.trip.overview.bounds.northeast.lat,
      data.trip.overview.bounds.northeast.lng));
    bounds.extend(new google.maps.LatLng(
      data.trip.overview.bounds.southwest.lat,
      data.trip.overview.bounds.southwest.lng));
    this.map.fitBounds(bounds);
  }

  addPolyline(polyline): void {
    if (polyline) {
      let linePoints = [];
      let nextLinePoint;
      for (let i = 0; i < polyline.length; i++) {
        nextLinePoint = new google.maps.LatLng(polyline[i][0], polyline[i][1]);
        linePoints.push(nextLinePoint);
      }
      let flightPath = new google.maps.Polyline({
        map: this.map,
        path: linePoints,
        strokeColor: '#ff00ff',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
    }
  }

  createInfoHtml(marker): string {
    let info = '';
    if (marker.icon_url) {

      // [city_state]
      // if day [0]
      //     Day [num] - [date string]
      // if (restart)
      //     End Day [num] - [date string]
      // if day [day.length - 1]
      //     End of Trip - [date string]
      //
      // 5:51 PM - local time
      // 4:51 PM - user time
      // [weather text]
      // [icon]

      // if (restart)
      //     Day [num] - [date string]
      //     9:19 AM - local time
      //     8:19 AM - user time
      //     [weather text]
      //     [icon]
      //

      info = `<div id="content" style="width: 100px;">
                 <p style="padding:0;margin:0;"><b>${marker.city_state}</b></p>`
      if (marker.dayIndex === 0) {
        info += `<p style="padding:0;margin:0;"><b>Day 1</b> - ${marker.date}</p>`;
      }
      if (marker.restart) {
        info += `<p style="padding:0;margin:0;"><b>End Day ${marker.dayIndex + 1}</b> - ${marker.restart.date_2}</p>`;
      }
      // if (marker.dayIndex === marker.length) { // last location
      //   info += `<p style="padding:0;margin:0;"><b>End of Trip</b> - ${marker.date}</p>`;
      // }

      info +=
        `<div id="bodyContent">
         <p style="color:blue;">${marker.time}</p>
         <p style="color:magenta;">${marker.time_user}</p>
         <p style="padding:0;margin:0;">${marker.text}</p>
         <img src="${marker.icon_url}" alt="${marker.text}">
       </div>`;

      if (marker.restart) {
        info += `<p style="padding:0;margin:0;"><b>Day ${marker.dayIndex + 1}</b> - ${marker.restart.date_2}</p >
        <div id="bodyContent">
          <p style="color:blue;">${marker.restart.time_2}</p>
          <p style="color:magenta;">${marker.restart.time_user_2}</p>
          <p style="padding:0;margin:0;">${marker.restart.text_2}</p>
          <img src="${marker.restart.icon_url_2}" alt="${marker.restart.text_2}">
        </div>`;
      }
      info += `</div>`;
    }
    return info;
  }

  points: any[] = [];
  options: any[] = [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f5f1e6' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#fdfcf8' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#0EFDAA' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#008B2D' }]
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#0EFDAA' }]
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#008B2D' }]
    },
    {
      featureType: 'road.local',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#c4deFF' }]
    }
  ];
}
