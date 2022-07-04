function calcBreakPeriod(hours_driving) {
  let break_period = (24 - hours_driving) * 3600000;
  // limit break_period to max ten hours bc 10 am
  // is a reasonable time to resume driving
  if (break_period > 36000000) {
    break_period = 36000000;
  }
  return break_period;
}

const fixStartTime = (depart_time_msec) => {
  // check and adjust trip start time so it can't be in the past
  // this adjustment may cause trip.overview.start_time_msec to be slightly
  // later than req.body.depart_time_msec
  let start_time_msec = depart_time_msec;
  let current_time_msec = Date.now();
  if (depart_time_msec < current_time_msec) {
    start_time_msec = current_time_msec;
  }
  return start_time_msec;
}
/*
example of req.body ->  {
  avg_speed: 50,
  depart_time_msec: 1656496806000,
  end_point: 'Sweetgrass MT',
  hours_driving: 10.2,
  miles_per_day: 510,
  origin: 'Baytown TX',
  timezone_city: 'America/New_York',
  midnight_msec: 1656561600000
}

*/
const createTripOverview = (req) => {
  let { avg_speed, depart_time_msec, end_point, hours_driving, midnight_msec, miles_per_day,
    origin, timezone_city, hotels, truck_stops, weather } = req.body;

  let overview = {
    "avg_speed": avg_speed,
    "bounds": {
      "northeast": {
        "lat": 0,
        "lng": 0
      },
      "southwest": {
        "lat": 0,
        "lng": 0
      }
    },
    "break_period": calcBreakPeriod(hours_driving),
    "drive_time_hours": hours_driving,
    "drive_time_msec": parseFloat(hours_driving) * 3600000,
    "end_point": end_point,
    "legs_per_day": null,
    "miles_per_day": miles_per_day,
    "origin": origin,
    "start_time_msec": fixStartTime(depart_time_msec),
    "midnight_msec": midnight_msec,
    // example of timezone_city: America/Los_Angeles
    "timezone_city": timezone_city,
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
        "polyline": [],
        // in production, time_points[] and weather[] are not needed in
        // overview. For now, they are included for diagnostics
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
    total_legs_max: null,
    total_legs_float: null,
    total_legs: null,
    meters_per_leg: null,
    legs_per_day: 1,
    total_meters: null,
    total_units: null,
    units_per_leg_float: null,
    units_per_leg: null,
    trip_url: '',
    polylinePts: null,
    legs: [],
    all_points: [],
    leg_distances: [],
    targets: [],
    meter_counts: [],
    track_units_per_leg: [],
    days: [],
    nodes: [],
    urls_OWM: [],
    urls_NOAA: [],
    patch_data: {},
    way_points: [],
    way_pts_prev: [],
    way_pts_indexes: [],
    way_pts_prev_idxs: [],
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