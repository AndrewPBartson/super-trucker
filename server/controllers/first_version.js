const axios = require('axios');
const polyline = require('polyline');
const keys = require('../../config/keys');
/* 
32187 meters = 20 miles
96561 meters = 60 miles
965606 meters = 600 miles
1287476 meters = 800 miles
*/
function setIntervalsPerDay(meters_per_day, total_meters) {
  let num_days = total_meters / meters_per_day
  let divide_by;
  if (num_days >= 24) {  // gray
    divide_by = -1;
  }
  else if (num_days < 24 && num_days >= 12) {  // green
    divide_by = 1;
  }
  else if (num_days < 24 && meters_per_day < 32187) {  // dark green
    divide_by = 1;
  }
  else if ((num_days < 12 && num_days >= 6) && meters_per_day >= 32187) {  // violet
    divide_by = 2;
  }
  else if (num_days < 12 && (meters_per_day < 96561 && meters_per_day >= 32187)) {  // dark violet
    divide_by = 2;
  }
  else if (num_days < 6 && num_days >= 4) {  // blue
    divide_by = 4;
  }
  else if ((meters_per_day >= 96561 && meters_per_day < 965606) && num_days < 4) {  // dark blue
    divide_by = 4;
  }
  else if (meters_per_day >= 965606 && (num_days < 4 && num_days >= 3)) {  // orange
    divide_by = 6;
  }
  else if ((meters_per_day >= 965606 && meters_per_day < 1287476) && num_days < 3) {  // dark orange
    divide_by = 6;
  }
  else if (meters_per_day >= 1287476 && (num_days < 3)) {  // yellow
    divide_by = 8;
  }
  return divide_by;
}

function getSimpleData(trip, response_1) {
  trip.total_meters = response_1.data.routes[0].legs[0].distance.value;
  trip.total_mi_text = response_1.data.routes[0].legs[0].distance.text;
  trip.polylinePts = response_1.data.routes[0].overview_polyline.points;
  // convert G_maps trip summary polyline to array of lat/lng coordinates
  trip.all_points = polyline.decode(trip.polylinePts)
  trip.num_segments_in_leg_array = [];
  trip.way_points_indexes = [];
}

function calcFirstTripVariables(trip) {

  trip.intervals_per_day = setIntervalsPerDay(trip.meters_per_day, trip.total_meters);
  // if intervals_per_day === -1, send error - "Trip takes too many days"
  trip.meters_per_interval = trip.meters_per_day / trip.intervals_per_day;
  // get total number of trip segments -
  trip.num_segments = trip.all_points.length - 1
  // calculate number of legs to destination (usually several legs per day)
  trip.num_legs = trip.total_meters / trip.meters_per_interval
  // determine number of segments that should be in each leg
  trip.segments_per_leg = trip.num_segments / trip.num_legs
  // convert to int for iteration: segments_per_leg and num_legs
  trip.segments_per_leg_round = Math.floor(trip.segments_per_leg);
  trip.num_legs_round = Math.ceil(trip.num_legs)
  // calculate number of 'leftover' segments in final driving period
  trip.leftovers = trip.num_segments - ((trip.num_legs_round - 1) * trip.segments_per_leg_round)
}

function calcFirstWayPoints(trip) {
  for (let t = 0; t < trip.num_legs_round; t++) {
    // if last leg, push number of "leftover" segments into last leg of trip
    if (t === trip.num_legs_round - 1) {
      trip.num_segments_in_leg_array.push(trip.leftovers)
    }
    else {
      trip.num_segments_in_leg_array.push(trip.segments_per_leg_round)
    }
  }
  let count = 0;
  // gather way_points:
  // grab out a point that (somewhat) corresponds to end of each leg
  for (let i = 0; i <= trip.num_legs_round - 1; i++) {
    trip.way_points.push(trip.all_points[count]);
    trip.way_points_indexes.push(count);
    count += trip.num_segments_in_leg_array[i]
  }
  // push destination
  trip.way_points.push(trip.all_points[trip.all_points.length - 1])
  trip.way_points_indexes.push(trip.all_points.length - 1);
  // now trip.way_points contains a first approximation of where stopping places should be
  return trip
}

function getInitialTripData(req, res, next) {
  let format_origin = req.trip.origin.split(" ").join("+")
  let format_end_point = req.trip.end_point.split(" ").join("+");
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${format_origin}&destination=${format_end_point}
    &key=${keys.GMkey}`
  return axios.get(trip_url)
    .then(response_1 => {
      getSimpleData(req.trip, response_1)
      calcFirstTripVariables(req.trip)
      calcFirstWayPoints(req.trip)
      return req;
    })
    .catch(function (error) {
      if (!error.data || error.data.status === "NOT_FOUND") {
        console.log(`search term(s) not found :(`);
      }
      console.log(error);
    });
}

module.exports = {
  getInitialTripData
}