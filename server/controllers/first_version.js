const axios = require('axios');
const polyline = require('polyline');
const keys = require('../../config/keys');

function setIntervalsPerDay(miles_per_day, total_mi) {
  let num_days = total_mi / miles_per_day
  let divide_by;
  if (num_days >= 24) {  // gray
    divide_by = -1;
  }
  else if (num_days < 24 && num_days >= 12) {  // green
    divide_by = 1;
  }
  else if (num_days < 24 && miles_per_day < 20) {  // dark green
    divide_by = 1;
  }
  else if ((num_days < 12 && num_days >= 6) && miles_per_day >= 20) {  // violet
    divide_by = 2;
  }
  else if (num_days < 12 && (miles_per_day < 60 && miles_per_day >= 20)) {  // dark violet
    divide_by = 2;
  }
  else if (num_days < 6 && num_days >= 4) {  // blue
    divide_by = 4;
  }
  else if ((miles_per_day >= 60 && miles_per_day < 600) && num_days < 4) {  // dark blue
    divide_by = 4;
  }
  else if (miles_per_day >= 600 && (num_days < 4 && num_days >= 3)) {  // orange
    divide_by = 6;
  }
  else if ((miles_per_day >= 600 && miles_per_day < 800) && num_days < 3) {  // dark orange
    divide_by = 6;
  }
  else if (miles_per_day >= 800 && (num_days < 3)) {  // yellow
    divide_by = 8;
  }
  return divide_by;
}

function calcFirstWayPoints(trip, response_1) {
  // get total length of trip in meters and miles
  trip.total_meters = response_1.data.routes[0].legs[0].distance.value
  trip.total_mi_text = response_1.data.routes[0].legs[0].distance.text
  trip.total_mi = trip.total_meters / 1609.34
  trip.num_intervals = setIntervalsPerDay(trip.miles_per_day, trip.total_mi);
  trip.meters_per_interval = trip.meters_per_day / trip.num_intervals;
  trip.miles_per_interval = trip.miles_per_day / trip.num_intervals;
  // take G_maps trip summary polyline and convert
  // to array of lat/lng coordinates
  trip.all_points = polyline.decode(response_1.data.routes[0].overview_polyline.points)
  // find out total number of points and segments -
  trip.num_segments = trip.all_points.length - 1
  // calculate number of legs to destination (usually more than one leg per day)
  trip.num_legs = trip.total_mi / trip.miles_per_interval
  // determine number of segments that should be in each leg
  trip.segments_per_leg = trip.num_segments / trip.num_legs
  // convert to int for iteration purposes: segments_per_leg and num_legs
  trip.segments_per_leg_round = Math.floor(trip.segments_per_leg);
  trip.num_legs_round = Math.ceil(trip.num_legs)
  // calculate number of 'leftover' segments in final driving period
  trip.leftovers = trip.num_segments - ((trip.num_legs_round - 1) * trip.segments_per_leg_round)
  trip.num_segments_in_leg_array = [];
  trip.way_points_indexes = [];
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
      if (!response_1.data || response_1.data.status === "NOT_FOUND") {
        console.log(`search term(s) not found :(`);
        return;  // What is supposed to happen when this returns?
      }
      calcFirstWayPoints(req.trip, response_1)
      return req;
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  getInitialTripData
}