
function isValidTripInput(req) {
  req.ok = true;
  // console.log('req_data :', req_data);
  // The incoming request must have the following or no deal:
  // origin, end_point, miles_per_day, 
  // hours_driving, avg_speed, depart_time
  // use functions similar to front end validation
  return true;
}

function setupDataStructure(req) {
  req.trip = {
    miles_per_day: req.body.miles_per_day,
    meters_per_day: req.body.miles_per_day * 1609.34,
    origin: req.body.origin,
    end_point: req.body.end_point,
    avg_speed: req.body.avg_speed,
    hours_driving: req.body.hours_driving,
    total_meters: 0,
    total_mi: 0,
    all_points: [],
    way_points: [],
    new_way_points: [],
    old_way_points: [],
    leg_distances: [],
    meter_counts: [],
    way_points_set: [],
    options: {},
    exports: {}
  };
  if (req.trip.weather) {
    req.trip.options.weather = true;
  }
  if (req.trip.hotels) {
    req.trip.options.hotels = true;
  }
  if (req.trip.truck_stops) {
    req.trip.options.truck_stops = true;
  }
  return req;
}

module.exports = {
  isValidTripInput,
  setupDataStructure
}