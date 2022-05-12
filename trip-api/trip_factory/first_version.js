const axios = require('axios');
const polyline = require('polyline');
// const GMkey = process.env.gmKey;
const GMkey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

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

function getSimpleData(req, prelim_data) {
  let polylinePts = req.factory.polylinePts;
  req.factory.total_meters = prelim_data.routes[0].legs[0].distance.value;
  req.payload.data.trip.overview.total_meters = prelim_data.routes[0].legs[0].distance.value;
  req.payload.data.trip.overview.total_mi_text = prelim_data.routes[0].legs[0].distance.text;
  req.payload.data.trip.overview.bounds.northeast.lat = prelim_data.routes[0].bounds.northeast.lat;
  req.payload.data.trip.overview.bounds.northeast.lng = prelim_data.routes[0].bounds.northeast.lng;
  req.payload.data.trip.overview.bounds.southwest.lat = prelim_data.routes[0].bounds.southwest.lat;
  req.payload.data.trip.overview.bounds.southwest.lng = prelim_data.routes[0].bounds.southwest.lng;
  polylinePts = prelim_data.routes[0].overview_polyline.points;
  // convert G_maps trip summary polyline to array of lat/lng coordinates
  req.factory.all_points = polyline.decode(polylinePts);
  req.payload.data.trip.polyline = req.factory.all_points;
}

function calcFirstTripVariables(factory) {
  factory.intervals_per_day = setIntervalsPerDay(factory.meters_per_day, factory.total_meters);
  // if intervals_per_day === -1, send error - "factory takes too many days"
  factory.meters_per_interval = factory.meters_per_day / factory.intervals_per_day;
  // get total number of factory segments -
  factory.num_segments = factory.all_points.length - 1
  // calculate number of legs to destination (usually several legs per day)
  factory.num_legs = factory.total_meters / factory.meters_per_interval
  // convert num_legs to int
  factory.num_legs_round = Math.ceil(factory.num_legs)
  // calculate number of segments that should be in each leg
  factory.segments_per_leg = factory.num_segments / factory.num_legs
  // convert segments_per_leg to int for iteration
  factory.segments_per_leg_round = Math.floor(factory.segments_per_leg);
  // calculate number of 'leftover' segments in final driving period
  factory.leftovers = factory.num_segments - ((factory.num_legs_round - 1) * factory.segments_per_leg_round)
}

function calcFirstWayPoints(factory) {
  for (let t = 0; t < factory.num_legs_round; t++) {
    // if last leg, push number of "leftover" segments into last leg
    if (t === factory.num_legs_round - 1) {
      factory.num_segments_in_leg_array.push(factory.leftovers)
    }
    else {
      factory.num_segments_in_leg_array.push(factory.segments_per_leg_round)
    }
  }
  let count = 0;
  // gather way_points:
  // grab out a point that (somewhat) corresponds to end of each leg
  for (let i = 0; i <= factory.num_legs_round - 1; i++) {
    factory.way_points.push(factory.all_points[count]);
    factory.way_pts_indexes.push(count);
    count += factory.num_segments_in_leg_array[i]
  }
  // push destination
  factory.way_points.push(factory.all_points[factory.all_points.length - 1])
  factory.way_pts_indexes.push(factory.all_points.length - 1);
  // now way_points are first approximation of where stopping places should be
  console.log('1st way_points', factory.way_points)
  return factory;
}

function getInitialTripData(req, res, next) {
  let origin = req.payload.data.trip.overview.origin.trim().split(" ").join("+")
  let end_point = req.payload.data.trip.overview.end_point.trim().split(" ").join("+");
  let first_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${origin}&destination=${end_point}
    &key=${GMkey}`
  return axios.get(first_url)
    .then(initial_res => {
      getSimpleData(req, initial_res.data)
      calcFirstTripVariables(req.factory)
      calcFirstWayPoints(req.factory)
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