import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PublishService } from '../services/publish.service';
import { ResizeService } from '../services/resize.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  mapSizeFlicker = true;
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

  constructor(
    private publishService: PublishService,
    private resizeService: ResizeService) { }

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 5,
  };

  ngAfterViewInit() {
    this.mapInitializer();
    this.publishService.transmitData.subscribe(data => {
      console.log('data for map :>> ', data);
      this.mapInitializer();
      this.data = data;
      this.setMapBounds(data)
      this.addPolyline(data.trip.polyline);
      this.createMarkerArr(this.buildMarkerData(data));
      this.showMainInfoWindows(data.trip.markers);
      // this.showMainInfoWindows([0, data.trip.markers.length - 1]);
    })
    this.resizeService.notifyResize.subscribe(() => {
      this.mapSizeFlicker = !this.mapSizeFlicker;
      this.mapSizeFlicker = !this.mapSizeFlicker;
    })
    let bounds = new google.maps.LatLngBounds();
    // set location where map first opens - middle of USA
    bounds.extend(new google.maps.LatLng(45.6, -81.0));
    bounds.extend(new google.maps.LatLng(30.6, -117.0));
    this.map.fitBounds(bounds)
  }

  mapInitializer() {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.markers = [];
  }

  buildMarkerData(data): any[] {
    let smallIcon, newMarker, restartInfo, dayNum = 0;
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
        dayNum: dayNum,
        date: data.trip.markers[i].date,
        time: data.trip.markers[i].time,
        time_user: data.trip.markers[i].time_user,
        text: data.trip.markers[i].text,
        icon: {},
        icon_url: data.trip.markers[i].icon,
        restart: null
      };
      if (data.trip.markers[i].restart) {
        dayNum++;
        let restHours;
        if (data.trip.markers[i].restart.rest_hours) {
          restHours = parseFloat((data.trip.markers[i].restart.rest_hours).toFixed(1)).toString()
        }
        restartInfo = {
          date_2: data.trip.markers[i].restart.date,
          time_2: data.trip.markers[i].restart.time,
          time_user_2: data.trip.markers[i].restart.time_user,
          text_2: data.trip.markers[i].restart.text,
          icon_url_2: data.trip.markers[i].restart.icon,
          rest_hours: restHours
        }
        newMarker.restart = restartInfo;
      }
      // icon is assigned separately from other properties just so
      // minor error in devtools console disappears :) 
      newMarker.icon = smallIcon;
      prelim_markers.push(newMarker);
    }
    return prelim_markers;
  }

  createMarkerArr(incoming): void {
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

      let infoContent = this.createInfoHtml(markerData, idx, incoming.length);
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

  showMainInfoWindows(markers_v1): void {
    for (let i = 0; i < markers_v1.length; i++) {
      if (markers_v1[i] && markers_v1[i].icon) {
        if (markers_v1[i].restart || i === 0 || i === markers_v1.length - 1) {
          google.maps.event.trigger(this.markers[i], 'click');
        }
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

  createInfoHtml(marker, idx, lastOne): string {
    let info = '';
    if (marker.icon_url) {
      info = `<div id="content" style="width: 100px;">`;
      if (idx === 0) {
        info += `<div style="padding-bottom:3px;margin:0;border:#2929ff solid 1px;border-radius:3px;font-family:Verdana;color:blue;font-size:larger;text-align:center;"><b>Begin Trip</b></div>`;
      }
      else if (idx === lastOne - 1) {
        info += `<div style="padding-bottom:3px;margin:0;border:#2929ff solid 1px;border-radius:3px;font-family:Verdana;color:blue;font-size:larger;text-align:center;"><b>End Trip</b></div>`;
      }
      else if (marker.restart) {
        info += `<div style="padding-bottom:3px;margin:0;border:#2929ff solid 1px;border-radius:3px;font-family:Verdana;color:blue;font-size:larger;text-align:center;"><b>Rest Stop</b></div>`;
      }
      else {
        info +=
          `<p style="padding:0;margin:0;"><b>Passing through</b></p>`
      }
      info +=
        `<div style="border:#838383 solid 1px;border-radius:3px;margin:3px 0;padding:4px;text-align:center;">
          <b>${marker.city_state}</b>
        </div>
        <p style="padding:0;margin:0;text-align:center;">
          at <span style="color:blue;font-size:larger";><b>${marker.time}</b></span>
        </p>
        <p style="padding:0;margin:0;text-align:center;">
          on <span style="color:blue;">${marker.date}</span>
        </p>
        <p style="padding:0;margin:0;text-align:center;">
          <span style="color:magenta;font-size:smaller;padding:0;margin:0;">
            ${marker.time_user}
          </span>
        </p>
        <div style="margin-top: 5px;border-radius:7px;background-color:#f3f3f3;text-align:center;">
          <p style="padding:4px 0;margin:0;text-align:center;" > ${marker.text} </p>
          <img style="width:100%;" src="${marker.icon_url}" alt="${marker.text}">
        </div>`;

      if (marker.restart) {
        info +=
          `<div style="padding:5px 0;margin:0;">
          <div style="padding:2px 0 5px 0;margin-bottom:10px;font-family:Verdana;color:white;text-align:center;background-color:gray;border-radius:3px;">
           Rest for <br/>${marker.restart.rest_hours} hours
          </div>
          <div style="padding-bottom:3px;margin:30px 0 0 0;border:#2929ff solid 1px;border-radius:3px;font-family:Verdana;color:blue;font-size:larger;text-align:center;"><b>Day ${marker.dayNum + 2}</b></div>
          <div style="border:#838383 solid 1px;border-radius:3px;margin:3px 0;padding:4px;text-align:center;">
            <b>${marker.city_state}</b>
          </div>
          <p style="padding:0;margin:3px 0 0 0;text-align:center;"><b>Resume driving</b></p>
          <p style="padding:0;margin:0;text-align:center;">
            <span style="color:blue;font-size:larger";><b>${marker.restart.time_2}</b></span>
          </p>
          <p style="padding:0;margin:0;text-align:center;">
            on <span style="color:blue;">${marker.restart.date_2}</span>
          </p>
          <p style="padding:0;margin:0;text-align:center;">
            <span style="color:magenta;font-size:smaller;padding:0;margin:0;">
              ${marker.restart.time_user_2}
            </span>
          </p>
            <div style="margin-top: 5px;border-radius:7px;background-color:#f3f3f3;text-align:center;">
            <p style="padding:4px 0;margin:0;text-align:center;" > ${marker.restart.text_2} </p>
            <img style="width:100%;" src="${marker.restart.icon_url_2}" alt="${marker.restart.text_2}">
          </div>`
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
