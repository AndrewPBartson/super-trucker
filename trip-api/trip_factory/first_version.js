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
  let days = total_meters / meters_per_day
  // let divide_by;
  // if (num_days >= 24) {  // gray
  //   divide_by = -1;
  //   // if divide_by === -1, send error - "Trip takes too many days, exceeds capability of google api"
  // }
  // else if (num_days < 24 && num_days >= 12) {  // green
  //   divide_by = 1;
  // }
  // else if (num_days < 24 && meters_per_day < 32187) {  // dark green
  //   divide_by = 1;
  // }
  // else if ((num_days < 12 && num_days >= 6.5) && meters_per_day >= 32187) {  // violet
  //   divide_by = 2;
  // }
  // else if (num_days < 12 && (meters_per_day < 96561 && meters_per_day >= 32187)) {  // dark violet
  //   divide_by = 2;
  // }
  // else if (num_days < 6.5 && num_days >= 4) {  // blue
  //   divide_by = 4;
  // }
  // else if ((meters_per_day >= 96561 && meters_per_day < 965606) && num_days < 4) {  // dark blue
  //   divide_by = 4;
  // }
  // else if (meters_per_day >= 965606 && (num_days < 4 && num_days >= 3)) {  // orange
  //   divide_by = 6;
  // }
  // else if ((meters_per_day >= 965606 && meters_per_day < 1287476) && num_days < 3) {  // dark orange
  //   divide_by = 6;
  // }
  // else if (meters_per_day >= 1287476 && (num_days < 3)) {  // yellow
  //   divide_by = 8;
  // }
  // return divide_by;
  if (days > 23) { return -1; }
  if (days > 11.5) { return 1; }
  if (days > 7.6) { return 2; }
  if (days > 5.7) { return 3; }
  if (days > 4.6) { return 4; }
  if (days > 3.8) { return 5; }
  if (days > 3.2) { return 6; }
  if (days > 2.8) { return 7; }
  if (days > 2.5) { return 8; }
  if (days > 2.3) { return 9; }
  if (days > 2) { return 10; }
  if (days > 1.8) { return 11; }
  if (days > 1) { return 12; }
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
  // convert Gmaps trip summary polyline to array of lat/lng coordinates
  req.factory.all_points = polyline.decode(polylinePts);
  req.payload.data.trip.polyline = req.factory.all_points;
}

const getMeterTargets = (req) => {
  // build array of points that divide route into equal distances
  let meters_per_leg = req.factory.total_meters / (req.factory.way_points.length - 1);
  console.log(`req.factory.total_meters`, req.factory.total_meters)
  let running_total = 0;
  for (let i = 0; i < req.factory.way_points.length; i++) {
    req.factory.target_stops.push(running_total);
    running_total += meters_per_leg;
  }
  console.log('req.factory.target_stops :>> ', req.factory.target_stops);
}

function calcFirstTripVariables(factory) {
  // Gmaps allows max of 23 waypoints per request.
  // This is apart from origin(?) and end_point(?), I think.
  // So I'm going with 24 as max number of cities that can be on final trip route.
  // Also app is configured to show cities that are 100 miles or more apart. 
  // That could be adjusted to, say, 50 miles apart for short trips.
  // But how much does weather change in 50 miles? 
  // What is optimal amount of weather data to show user?

  // meters_per_day is from user input, converted from miles per day - ok
  factory.intervals_per_day = setIntervalsPerDay(factory.meters_per_day, factory.total_meters);
  // make initial estimate for meters_per_interval (target meters per day) - ok
  factory.meters_per_interval = factory.meters_per_day / factory.intervals_per_day;
  // get total number of segments in original polyline from gmaps
  // subtract 1 bc number of distances is always one less than number of places- ok
  factory.num_segments = factory.all_points.length - 1;
  // calculate number of legs to destination - ok
  factory.num_legs_float = factory.total_meters / factory.meters_per_interval
  // convert num_legs to int - ok
  factory.num_legs = Math.ceil(factory.num_legs_float)
  // calculate number of segments that should be in each leg if
  // segments were all same length - ok
  factory.segments_per_leg_float = factory.num_segments / factory.num_legs
  // convert segments_per_leg_float to int for iteration
  // needs to be floor, not round - ok
  factory.segments_per_leg = Math.floor(factory.segments_per_leg_float);
  // calculate number of 'leftover' segments in final driving period
  factory.leftovers = factory.num_segments - ((factory.num_legs) * factory.segments_per_leg);
  console.log(`factory.num_segments`, factory.num_segments)
  console.log(`factory.num_legs`, factory.num_legs)
  console.log(`factory.num_legs_float`, factory.num_legs_float)
  console.log('factory.segments_per_leg :>> ', factory.segments_per_leg);
  console.log('factory.segments_per_leg_float :>> ', factory.segments_per_leg_float);
  console.log(`factory.leftovers`, factory.leftovers);
  let test = factory.leftovers + (factory.num_legs * factory.segments_per_leg)
  console.log('should be equal to num_segments :>> ', test);
}

// remember that num_legs is one less than number of waypoints
function calcFirstWayPoints(factory) {
  // 1st loop -
  // build array of number of segments in each leg
  // for now, all legs have same amount, except last leg has leftover amount
  for (let i = 0; i < factory.num_legs; i++) {
    // push average number of segments per leg
    factory.track_segments_per_leg.push(factory.segments_per_leg);
    // if last full-size leg, also push number of "leftover" segments as last leg in array
    if (i === factory.num_legs - 1 && factory.leftovers > 0) {
      factory.track_segments_per_leg.push(factory.leftovers)
    }
  }
  console.log('factory.track_segments_per_leg.length :>> ', factory.track_segments_per_leg.length);
  console.log('factory.track_segments_per_leg :>> ', factory.track_segments_per_leg);

  // 2nd loop - gather way_points
  // grab out a point that (somewhat) corresponds to end of each leg
  let count = 0;
  for (let j = 0; j < factory.track_segments_per_leg.length; j++) {
    factory.way_points.push(factory.all_points[count]);
    factory.way_pts_indexes.push(count);
    count += factory.track_segments_per_leg[j];
    // add destination - bc number of distances is one less than number of places
    if (j === factory.track_segments_per_leg.length - 1) {
      factory.way_points.push(factory.all_points[count]);
      factory.way_pts_indexes.push(count);
    }
  }
  // now way_points are first approximation of where stopping places should be
  console.log('1st way_points.length', factory.way_points.length);
  console.log('1st way_points', factory.way_points);
  console.log(`factory.way_pts_indexes.length`, factory.way_pts_indexes.length)
  console.log(`factory.way_pts_indexes`, factory.way_pts_indexes)
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
      getMeterTargets(req)
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