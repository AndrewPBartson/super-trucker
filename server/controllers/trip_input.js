
function isValidTripInput(req) {
  req.ok = true;
  console.log('isValidTripInput() - req.body :', req.body);
  // incoming request must have -
  // origin, end_point, miles_per_day 
  return true;
}

function setupDataStructure(req, res, next) {
  console.log('req.body :>> ', req.body);
  req.trip = {
    miles_per_day: req.body.miles_per_day,
    meters_per_day: req.body.miles_per_day * 1609.34,
    origin: req.body.origin,
    end_point: req.body.end_point,
    avg_speed: req.body.avg_speed,
    hours_driving: req.body.hours_driving,
    depart_time: req.body.depart_time,
    weather: req.body.weather,
    total_meters: 0,
    total_mi: 0,
    all_points: [],

    way_points: [],
    way_points_indexes: [],

    old_way_points: [],
    old_way_pts_indexes: [],

    old_way_points_2: [],
    old_way_pts_2_indexes: [],

    leg_distances: [],
    meter_counts: [],
    
    services: {},
    exports: {}
  };
  if (req.body.hotels || req.body.truck_stops) {
    req.trip.way_points_set = [];
  }
  if (req.body.hotels) {
    req.trip.services.hotels = true;
  }
  if (req.body.truck_stops) {
    req.trip.services.truck_stops = true;
  }
  console.log('*** setupDataStructure() - req.trip: ', req.trip);
  return req;
}

module.exports = {
  isValidTripInput,
  setupDataStructure
}