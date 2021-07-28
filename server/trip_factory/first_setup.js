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

const setupPayload = (req, res, next) => {
  req.payload = {
    "data": {
      "trip": {
        "days": [],
        "overview": {}
      }
    }
  }
  return req;
}

const createTripOverview = (req, res, next) => {
  let { avg_speed, depart_time, end_point, hours_driving, miles_per_day,
    origin, timezone_user, time_user_str, hotels, truck_stops, weather } = req.body;
  // make sure start_time is not in the past
  // is this working?
  // date/time picker should refresh and not show times in the past
  let start_time = new Date(depart_time);
  let current_time = new Date();
  if (current_time > start_time) {
    start_time = current_time;
  }
  // convert date object to milliseconds
  let start_time_msec = start_time.getTime();

  req.payload.data.trip.overview = {
    "avg_speed": avg_speed,
    "bounds": {},
    "break_period": calcBreakPeriod(hours_driving),
    "drive_time_hours": hours_driving,
    "drive_time_msec": parseFloat(hours_driving) * 3600000,
    "end_point": end_point,
    "intervals_per_day": null,
    "miles_per_day": miles_per_day,
    "origin": origin,
    "start_time": start_time_msec,
    "timezone_user": formatTimezoneUser(timezone_user, time_user_str),
    "timezone_user_str": timezone_user,
    "services": {
      "hotels": hotels,
      "truck_stops": truck_stops,
      "weather": weather
    },

    "end_time": null,
    "summary": null,
    "total_meters": null,
    "total_mi": null,
    "total_mi_text": null,
    "total_hrs_text": null,
    "time_points": [],
    "weather": []
  }
  return req;
}

function setupTripFactory(req, res, next) {
  let { hotels, truck_stops, weather } = req.payload.data.trip.overview.services;
  let { miles_per_day, avg_speed } = req.payload.data.trip.overview;
  req.factory = {
    meters_per_day: miles_per_day * 1609.34,
    meters_per_second: avg_speed / 2.237,
    meters_per_interval: null,
    total_meters: null,
    legs: [],
    all_points: [],
    polylinePts: null,
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
    days: [],
    nodes: [],
    time_points: [],
    weather: [],
    urls_OWM: [],
    urls_NOAA: [],
    patch_data: {},

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

module.exports = {
  setupPayload,
  createTripOverview,
  setupTripFactory
}