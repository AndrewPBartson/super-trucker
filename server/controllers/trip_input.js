
function isValidTripInput(req) {
  req.ok = true;
  // incoming request must have -
  // origin, end_point, miles_per_day.
  // the other essential values are avg_speed and hours_driving.
  // default for avg_speed should be 60 (55? 65?)
  // and then calculate hours_driving based 
  // on miles_per_day and default value for avg_speed 
  return true;
}

function setupDataStructure(req, res, next) {
  console.log('req.body :>> ', req.body);
  req.trip = {
    miles_per_day: req.body.miles_per_day,
    num_intervals: 1,
    miles_per_interval: 0,
    meters_per_day: req.body.miles_per_day * 1609.34,
    origin: req.body.origin,
    end_point: req.body.end_point,
    avg_speed: req.body.avg_speed,
    meters_per_second: req.body.avg_speed / 2.237,
    meters_per_hour: req.body.avg_speed * 1609.34,
    hours_driving: req.body.hours_driving,
    depart_time: req.body.depart_time,
    weather: req.body.weather,
    total_meters: 0,
    total_mi: 0,
    total_mi_text: "",
    all_points: [],
    leg_distances: [],
    meter_counts: [],
    services: {},

    way_points: [],
    way_points_indexes: [],

    old_way_points: [],
    old_way_pts_indexes: [],

    old_way_points_2: [],
    old_way_pts_2_indexes: [],

    old_way_points_3: [],
    old_way_pts_3_indexes: [],
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