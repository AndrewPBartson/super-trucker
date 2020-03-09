
function isValidTripInput(req) {
  req.ok = true;
  console.log('req.body :', req.body);
  // incoming request must have -
  // origin, end_point, miles_per_day 
  return true;
}

function setupDataStructure(req, res, next) {
  req.trip = {
    miles_per_day: req.body.miles_per_day,
    meters_per_day: req.body.miles_per_day * 1609.34,
    origin: req.body.origin,
    end_point: req.body.end_point,
    avg_speed: req.body.avg_speed,
    hours_driving: req.body.hours_driving,
    weather: req.body.weather,
    total_meters: 0,
    total_mi: 0,
    all_points: [],
    way_points: [],
    new_way_points: [],
    way_points_indexes: [],
    old_way_points: [],
    leg_distances: [],
    meter_counts: [],
    way_points_set: [],
    services: {},
    exports: {}
  };
  if (req.body.hotels) {
    req.trip.services.hotels = true;
  }
  if (req.body.truck_stops) {
    req.trip.services.truck_stops = true;
  }
  console.log('*** input.setupDataStructure() - req.trip: ', req.trip);
  return req;
}

module.exports = {
  isValidTripInput,
  setupDataStructure
}