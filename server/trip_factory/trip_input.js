const { Collection } = require('mongoose');

function calcBreakPeriod(hours_driving) {
  // calculate break_period in milliseconds
  let break_period = (24 - hours_driving) * 3600000;
  // limit break_period to max ten hours
  if (break_period > 36000000) {
    break_period = 36000000;
  }
  return break_period;
}

// fix timezone created by browser/angular
const formatTimezoneUser = (tz_user, time_user_str) => {
  let tz_id;
  // if timezone_user begins with "GMT" 
  if (tz_user.toString().substring(0, 3) === "GMT") {
    tz_id = tz_user.substring(0, 8);
  } else { // else use time_user_str
    tz_id = time_user_str.toString().split(' ')[5];
  }
  // insert colon (GMT-0700 becomes GMT-07:00)
  let tz_id_final = tz_id.slice(0, 6) + ':' + tz_id.slice(6);
  return tz_id_final;
}

function setupForCalculations(req, res, next) {
  let { miles_per_day, avg_speed, hotels, truck_stops, weather } = req.body;
  req.factory = {
    meters_per_day: miles_per_day * 1609.34,
    meters_per_second: avg_speed / 2.237,
    meters_per_interval: null,
    total_meters: 0,
    legs: [],
    all_points: [],
    leg_distances: [],
    meter_counts: [],
    num_legs: null,
    num_legs_round: null,
    num_segments: null,
    segments_per_leg: null,
    segments_per_leg_round: null,
    num_segments_in_leg_array: [],
    leftovers: null,
    trip_url: '',
    urls_NOAA: [],
    urls_OWM: [],

    way_points: [],
    way_points_B: [],
    way_points_C: [],
    way_points_D: [],
    way_pts_indexes: [],
    way_pts_B_indexes: [],
    way_pts_C_indexes: [],
    way_pts_D_indexes: [],
  };
  if (hotels || truck_stops || weather) {
    req.factory.way_points_extra = [];
  }
  return req;
}

const setupPayload = (req, res, next) => {
  let { avg_speed, depart_time, end_point, hours_driving, miles_per_day,
    origin, timezone_user, time_user_str, hotels, truck_stops, weather } = req.body;
  // convert date object to milliseconds
  let start_time;
  depart_time ? start_time = new Date(depart_time) : start_time = newDate();
  let start_time_msec = start_time.getTime();
  req.payload = {
    "data": {
      "trip": {
        "overview": {
          "origin": origin,
          "end_point": end_point,
          "start_time": start_time_msec,
          "drive_time_hours": hours_driving,
          "drive_time_msec": parseFloat(hours_driving) * 3600000,
          "avg_speed": avg_speed,
          "miles_per_day": miles_per_day,
          "break_period": calcBreakPeriod(hours_driving),
          "timezone_user_str": timezone_user,
          "timezone_user": formatTimezoneUser(timezone_user, time_user_str),
          "total_meters": null,
          "total_mi": null,
          "total_mi_text": null,
          "summary": null,
          "services": {
            "hotels": hotels,
            "truck_stops": truck_stops,
            "weather": weather
          },
          "bounds": {},
          "intervals_per_day": null
        },
        "nodes": [],
        "day_nodes": [],
        "time_points": [],
        "weather": []
      }
    }
  };
  return req;
}

module.exports = {
  setupForCalculations,
  setupPayload
}