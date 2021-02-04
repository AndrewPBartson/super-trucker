const { TimeoutError } = require('rxjs');

function isValidTripInput(req) {
  req.ok = true;
  // incoming request must have -
  // origin, end_point, miles_per_day, timezone_user, time_str_user.
  // set other essential values - avg_speed and hours_driving
  // default for avg_speed should be 60 (check)
  // and then calculate hours_driving based 
  // on miles_per_day and default value for avg_speed 
  return true;
}

function calcBreakPeriod(hours_driving) {
  // determine break_period in milliseconds -
  let break_period = (24 - hours_driving) * 3600000;
  // limit break_period to max ten hours -
  if (break_period > 36000000) {
    break_period = 36000000;
  }
  return break_period;
}

const getTimezoneId = (req) => {
  // if timezone_user begins with "GMT", use it to get timezone id
  // else use time_str_user to get timezone id
  if (req.body.timezone_user.toString().substring(0, 3) === "GMT") {
    return req.body.timezone_user.substring(0, 8);
  } else {
    return req.body.time_str_user.toString().split(' ')[5].substring(3);
  }
}

function setupTripStructure(req, res, next) {
  let { miles_per_day, origin, end_point, avg_speed, hours_driving, depart_time,
    timezone_user, time_str_user, hotels, truck_stops, weather } = req.body;
  req.trip = {
    miles_per_day: miles_per_day,
    intervals_per_day: null,
    meters_per_day: miles_per_day * 1609.34,
    origin: origin,
    end_point: end_point,
    avg_speed: avg_speed,
    meters_per_second: avg_speed / 2.237,
    meters_per_hour: avg_speed * 1609.34,
    hours_driving: hours_driving,
    break_period: calcBreakPeriod(hours_driving),
    depart_time: depart_time,
    timezone_user: timezone_user,
    time_str_user: time_str_user,
    timezone_id_user: getTimezoneId(req),
    total_meters: null,
    total_mi_text: "",
    all_points: [],
    leg_distances: [],
    meter_counts: [],
    services: {},
    weather: [],

    way_points: [],
    way_points_indexes: [],

    old_way_points: [],
    old_way_pts_indexes: [],

    old_way_points_2: [],
    old_way_pts_2_indexes: [],

    old_way_points_3: [],
    old_way_pts_3_indexes: [],
  };
  if (hotels || truck_stops || weather) {
    req.trip.way_points_extra = [];
  }
  if (hotels) {
    req.trip.services.hotels = true;
  }
  if (truck_stops) {
    req.trip.services.truck_stops = true;
  }
  if (weather) {
    req.trip.services.weather = true;
  }
  return req;
}

module.exports = {
  isValidTripInput,
  setupTripStructure
}