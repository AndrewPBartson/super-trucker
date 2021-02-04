import { Component, OnInit } from '@angular/core';
import { Leg } from '../../models/Leg';

@Component({
  selector: 'app-trip-summary',
  templateUrl: './trip-summary.component.html',
  styleUrls: ['./trip-summary.component.css']
})
export class TripSummaryComponent implements OnInit {
  trip;
  legs: Leg[];
  showDetails = true;
  panelOpenState: boolean = false;
  allExpandState = false;

  constructor() { }

  nodeStyles(): Object {
    if (/** YOUR CONDITION TO SHOW THE STYLES*/  false) {
      // return { height: this.height, width: this.width }
    }
    return {}
  }

  ngOnInit() {
    this.trip = {
      "params": {
        "origin": "Elk City OK",
        "end_point": "Holbrook AZ",
        "start_time": 1612317375705,
        "drive_time_msec": 22500000,
        "drive_time_hours": 6.25,
        "avg_speed": "65",
        "miles_per_day": "400",
        "break_period": 36000000,
        "time_zone_user": "-0900",
        "total_meters": 1065466,
        "total_mi": 663,
        "summary": "I-40 W",
        "bounds": {
          "northeast": {
            "lat": 35.5341621,
            "lng": -99.4042228
          },
          "southwest": {
            "lat": 34.9021439,
            "lng": -110.1581993
          }
        }
      },
      "nodes": [
        {
          "cityState": "Elk City OK",
          "address": "201 E 3rd St, Elk City, OK 73644, USA",
          "latLng": {
            "lat": 35.41199,
            "lng": -99.4042228
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Elk City OK",
              "status": "start_trip",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999992,
          "type": "start_trip"
        },
        {
          "cityState": "Clarendon TX",
          "address": "I-40, Clarendon, TX 79226, USA",
          "latLng": {
            "lat": 35.1813616,
            "lng": -100.9893599
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Clarendon TX",
              "status": "enroute",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg":
          {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999993,
          "type": "enroute"
        },
        {
          "cityState": "San Jon NM",
          "address": "I-40, San Jon, NM 88434, USA",
          "latLng": {
            "lat": 35.1829772,
            "lng": -103.0692393
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "San Jon NM",
              "status": "enroute",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999994,
          "type": "enroute"
        },
        {
          "cityState": "Santa Rosa NM",
          "address": "US-54, Santa Rosa, NM 88435, USA",
          "latLng": {
            "lat": 34.9446454,
            "lng": -104.6725179
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Santa Rosa NM",
              "status": "enroute",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999995,
          "type": "enroute"
        },
        {
          "cityState": "Albuquerque NM",
          "address": "2806 Nicolas Rd NW, Albuquerque, NM 87104, USA",
          "latLng": {
            "lat": 35.1056111,
            "lng": -106.6815108
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Albuquerque NM",
              "status": "enroute",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999996,
          "type": "enroute"
        },
        {
          "cityState": "Bluewater NM",
          "address": "I-40, Bluewater, NM 87005, USA",
          "latLng": {
            "lat": 35.2469531,
            "lng": -107.9606518
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Bluewater NM",
              "status": "end_day",
              "timezone_id_local": ""
            },
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Bluewater NM",
              "status": "start_day",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999997,
          "day_start_meters": 0,
          "hours_today": "8 hours 5 min",
          "miles_today": "515 miles",
          "day_start_time": 1611292519261,
          "type": "rest_stop"
        },
        {
          "cityState": "Houck AZ",
          "address": "I-40, Houck, AZ 86506, USA",
          "latLng": {
            "lat": 35.26652,
            "lng": -109.27164
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Houck AZ",
              "status": "enroute",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999998,
          "type": "enroute"
        },
        {
          "cityState": "Holbrook AZ",
          "address": "222 Navajo Blvd, Holbrook, AZ 86025, USA",
          "latLng": {
            "lat": 34.9021439,
            "lng": -110.1581993
          },
          "time_points": [
            {
              "time_stamp": null,
              "time_text": "11:57 am",
              "date_text": "12/31",
              "city_state": "Holbrook AZ",
              "status": "end_trip",
              "timezone_id_local": ""
            }
          ],
          "weather_set": [],
          "next_leg": {
            "distance": {
              "meters": 194869,
              "text_mi": "121 mi"
            },
            "duration": {
              "seconds_est": 5036,
              "text_est": "1 hour 24 mins",
              "seconds": 5353,
              "msec": 5353416,
              "text": "1 hour 29 mins"
            }
          },
          "time_zone_local": "",
          "meter_count": 99999999,
          "hours_today": "2 hours 15 min",
          "miles_today": "143 miles",
          "type": "end_trip"
        }
      ],
      "day_nodes": [
        [0, 1, 2, 3, 4],
        [5, 6],
        [7]
      ],
      "time_points": [
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Elk City OK",
          "status": "start_trip",
          "local_time_zone": "",
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Clarendon TX",
          "status": "enroute",
          "local_time_zone": "",
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "San Jon NM",
          "status": "enroute",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Santa Rosa NM",
          "status": "enroute",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Albuquerque NM",
          "status": "enroute",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Bluewater NM",
          "status": "end_day",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Bluewater NM",
          "status": "start_day",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Houck AZ",
          "status": "enroute",
          "local_time_zone": "",
          "weather": {}
        },
        {
          "time_stamp": null,
          "time_text": "11:57 am",
          "date_text": "12/31",
          "city_state": "Holbrook AZ",
          "status": "end_trip",
          "local_time_zone": "",
          "weather": {}
        }
      ],
      "weather_setz": []
    }
  }
}
