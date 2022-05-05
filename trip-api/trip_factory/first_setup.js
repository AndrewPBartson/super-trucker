const moment = require('moment-timezone');

function calcBreakPeriod(hours_driving) {
  // calculate break_period in milliseconds
  let break_period = (24 - hours_driving) * 3600000;
  // limit break_period to max ten hours
  if (break_period > 36000000) {
    break_period = 36000000;
  }
  return break_period;
}

const extractTimezoneFromDateStr = (date_str) => {
  // date_str is depart_time in ISO format, has browser timezone
  // extract relevant substring from date_str
  let tz_id = date_str.toString().split(' ')[5];
  // insert colon - GMT-0700 becomes GMT-07:00
  let tz_id_final = tz_id.slice(0, 6) + ':' + tz_id.slice(6);
  return tz_id_final;
}

const determineHomeTimezone = (timezone_user, time_user_str) => {
  // examples of timezone_user: 'America/Anchorage', 'GMT-0600 (MDT CST)'
  // example of time_user_str: 'Sat Apr 23 2022 12:00:16 GMT-0800 (Alaska Daylight Time)'
  // if timezone_user begins with GMT, that means user selected timezone from UI dropdown
  if (timezone_user.toString().substring(0, 3) === "GMT") {
    // extract timezone offset = digits after "GMT"
    let tz_custom = timezone_user.substring(0, 8);
    tz_custom = tz_custom.slice(0, 6) + ':' + tz_custom.slice(6);
    return tz_custom;
  } else {
    // use timezone derived from user's browser  
    let tz_browser = extractTimezoneFromDateStr(time_user_str);
    // example of tz_browser: 'GMT-07:00 (MST)'
    return tz_browser;
    // example of return value: GMT-06:00
  }
}
/*
example of req.body  {
  origin: 'Jasper AL',
  end_point: 'Little Rock AR',
  miles_per_day: 390,
  avg_speed: 65,
  hours_driving: 6,
  depart_time: '2022-04-23T20:00:16.263Z',
  timezone_user: 'America/Anchorage',
  time_user_str: 'Sat Apr 23 2022 12:00:16 GMT-0800 (Alaska Daylight Time)',
  weather: true
}
*/
const createTripOverview = (req) => {
  let { avg_speed, depart_time, end_point, hours_driving, miles_per_day,
    origin, timezone_user, time_user_str, hotels, truck_stops, weather } = req.body;
  console.log('req.body :>> ', req.body);
  let tz_id = determineHomeTimezone(timezone_user, time_user_str);
  // let testing_moment = moment(depart_time).tz(tz_id);
  // console.log('testing_moment :>> ', testing_moment);

  // depart_time (string) is in ISO format 
  // therefore start_time (Date object) is assigned UTC timezone
  let start_time = new Date(depart_time);
  let start_time_msec = start_time.getTime();
  let current_time_msec = Date.now();
  // everything seems good so far
  // process trip start time so it can't be in the past
  if (current_time_msec > start_time_msec) {
    start_time_msec = current_time_msec;
  }

  let overview = {
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
    // examples of timezone_user: GMT-08:00, GMT-04:00
    "timezone_user": tz_id,
    // example of time_user_str: 'Sat Apr 23 2022 12:00:16 GMT-0800 (Alaska Daylight Time)'
    "timezone_user_str": time_user_str,
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
    "total_hrs_text": null
  }
  return overview;
}

const setupPayload = (req, res, next) => {
  req.payload = {
    "data": {
      "trip": {
        "days": [],
        "cities": [],
        "markers": [],
        // in production, time_points[] and weather[] are not needed,
        // at least in theory. But for easier testing, seems 
        // best to include permanently 
        "time_points": [],
        "weather": [],
        "overview": createTripOverview(req)
      }
    }
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