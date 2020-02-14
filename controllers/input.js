
function isValidTripInput(req_data) {
  // console.log('req_data :', req_data);
  // The incoming request must have the following or no deal:
  // origin, end_point, miles_per_day, 
  // hours_driving, avg_speed, depart_time
  // use functions similar to the front end validation
  // spin it off into input-controller
  return true; 
}

function handleInputData(req_data) {
  let trip = false;
  if (isValidTripInput(req_data)) {
  trip = {};
  trip.exports = {}
  trip.way_points = []
  trip.miles_per_day = req_data.miles_per_day 
  trip.meters_per_day = trip.miles_per_day * 1609.34
  trip.origin = req_data.origin
  trip.end_point = req_data.end_point
  trip.leg_distances = []
  trip.meter_counts = []
  return trip;
  }
}

module.exports = {
  handleInputData
}