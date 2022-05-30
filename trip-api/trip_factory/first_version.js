const axios = require('axios');
const polyline = require('polyline');
// const GMkey = process.env.gmKey;
const GMkey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

function between(x, min, max) {
  return x >= min && x < max;
}
/* 
32187 meters = 20 miles
40234 meters = 25 miles
48281 meters = 30 miles
56327 meters = 35 miles
72420 meters = 45 miles
88514 meters = 55 miles
96561 meters = 60 miles
160934 meters = 100 miles
321869 meters = 200 miles
482803 meters = 300 miles
643738 meters = 400 miles
804672 meters = 500 miles
965606 meters = 600 miles
1287476 meters = 800 miles
// remember that num_legs is one less than number of waypoints
*/
function setLegsPerDay(meters_per_day, total_meters) {
  let total_days = 0;
  let legs_per_day = 1;
  let leg_cap = 1;
  if (meters_per_day > total_meters) {
    total_days = 1;
  }
  else { total_days = total_meters / meters_per_day }

  if (total_days > 23) { legs_per_day = -1; }   // too many days, exceeds google api capacity
  else if (total_days > 11.5) { legs_per_day = 1; }  // total legs per trip: 12 - 23
  else if (total_days > 7.6) { legs_per_day = 2; }   // total legs per trip: 14 - 23
  else if (total_days > 5.7) { legs_per_day = 3; }   // total legs per trip: 15 - 23
  else if (total_days > 4.6) { legs_per_day = 4; }   // total legs per trip: 16 - 23
  else if (total_days > 3.8) { legs_per_day = 5; }   // total legs per trip: 20 - 23
  else if (total_days > 3.2) { legs_per_day = 6; }   // total legs per trip: 20 - 23
  else if (total_days > 2.8) { legs_per_day = 7; }
  else if (total_days > 2.5) { legs_per_day = 8; }
  else if (total_days > 2.3) { legs_per_day = 9; }
  else if (total_days > 2) { legs_per_day = 10; }
  else if (total_days > 1.8) { legs_per_day = 11; }
  else if (total_days >= 1) { legs_per_day = 12; }

  if (total_meters < 965606) {
    // prevent showing too many weather reports over short distance  
    if (between(total_meters, 804672, 965606)) { // 500 - 600 miles
      leg_cap = meters_per_day / 88514; // at least 55 mi per leg
    }
    else if (between(total_meters, 643738, 804672)) { // 400 - 500 miles
      leg_cap = meters_per_day / 72420; // at least 45 mi per leg
    }
    else if (between(total_meters, 482803, 643738)) { // 300 - 400 miles
      leg_cap = meters_per_day / 56327; // at least 35 mi per leg
    }
    else if (between(total_meters, 321869, 482803)) {  // 200 - 300 miles
      leg_cap = meters_per_day / 48281; // at least 30 mi per leg
    }
    else if (between(total_meters, 0, 321869)) { // 0 - 200 miles
      leg_cap = meters_per_day / 40233; // at least 25 mi per leg
    }
    leg_cap = Math.floor(leg_cap)
    if (leg_cap < 1) { leg_cap = 1; }
    if (legs_per_day > leg_cap) {
      legs_per_day = leg_cap;
    }
  }
  return legs_per_day;
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

const calcMetersPerLeg = (total_meters, meters_per_day) => {
  let max_legs = 23;
  let days = total_meters / meters_per_day;
  let legs_per_day = max_legs / days;
  let total_legs = Math.floor(legs_per_day) * days;
  return total_meters / total_legs;
}

const setupTargets = (req) => {
  /* 
  // Create two arrays -
  // 1) target_points - has meter count at ideal location for each way_point
  // 2) target_calcs - has element for each way_point containing data for improving 
  // spacing between neighboring way_points. 
  // Goal - divide route into nearly equal distances (legs)
  */
  let meters_per_leg = calcMetersPerLeg(req.factory.total_meters, req.factory.meters_per_day);
  let running_total = 0;
  let calcsObj = {};
  for (let i = 0; i < req.factory.way_points.length; i++) {
    req.factory.target_points.push(running_total);
    calcsObj = {
      target_meters: Math.round(running_total),
      estimate: {
        est_idx: null,
        meters: null
      },
      search_area: {
        min_idx: 0,
        min_meters: 0,
        max_idx: null,
        max_meters: null
      },
      diff: 0,
      isGood: false
    };
    if (i === 0 || i === req.factory.way_points.length - 1) {
      calcsObj.isGood = true;
    }
    req.factory.target_calcs.push(calcsObj);
    running_total += meters_per_leg;
  }
}
/*  
  // Gmaps allows max of 23 waypoints per request.
  // This seems to be apart from origin and end_point.
  // So I'm going with 23 as max number of cities that can be on final trip route.
  // Design decision - What is optimal amount of weather data to show user?
  // App is configured to show locations that are at least 25 miles apart. 
  // Maybe that will provide enough weather reports because weather 
  // doesn't change that much in 25 miles
*/
function calcFirstTripVariables(factory) {
  // if length of trip is less than meters_per_day, set meters_per_day to length of trip
  if (factory.total_meters < factory.meters_per_day) {
    factory.meters_per_day = factory.total_meters;
  }
  // meters_per_day is from user input, converted from miles per day
  factory.legs_per_day = setLegsPerDay(factory.meters_per_day, factory.total_meters);
  // make initial estimate for meters_per_leg (target meters per day)
  factory.meters_per_leg = calcMetersPerLeg(factory.total_meters, factory.meters_per_day);
  // get total number of units in original polyline from gmaps
  // subtract 1 bc number of distances is always one less than number of places
  factory.num_units = factory.all_points.length - 1;
  // calculate number of legs to destination
  factory.num_legs_float = factory.total_meters / factory.meters_per_leg
  if (factory.num_legs_float < 1) {
    factory.num_legs = 1;
  }
  // convert num_legs to int
  factory.num_legs = Math.ceil(factory.num_legs_float)
  // calculate number of units that should be in each leg if
  // units were all same length
  factory.units_per_leg_float = factory.num_units / factory.num_legs
  // convert units_per_leg_float to int for iteration
  // needs to be floor, not round
  factory.units_per_leg = Math.floor(factory.units_per_leg_float);
  // calculate number of 'leftover' units in final driving period
  factory.leftovers = factory.num_units - ((factory.num_legs) * factory.units_per_leg);
}

function calcFirstWayPoints(factory) {
  // 1st loop -
  // build initial version of track_units_per_leg array.
  // each element is number of units for current leg
  // at the outset, all legs have same amount, except last leg has leftover amount
  for (let i = 0; i < factory.num_legs; i++) {
    // push average number of units per leg
    factory.track_units_per_leg.push(factory.units_per_leg);
    // if last full-size leg, also push number of "leftover" units as last leg in array
    if (i === factory.num_legs - 1 && factory.leftovers > 0) {
      factory.track_units_per_leg.push(factory.leftovers)
    }
  }
  // 2nd loop -
  // Select index of one all_point (point from polyline) that
  // is best guess for next way_point, which is closest to current target.
  // target is the ideal location for end of current leg
  // spacing of way_points needs to be as even as possible
  let count = 0;
  for (let j = 0; j < factory.track_units_per_leg.length; j++) {
    factory.way_points.push(factory.all_points[count]);
    factory.way_pts_indexes.push(count);
    count += factory.track_units_per_leg[j];
    // add destination - bc number of distances is one less than number of places
    if (j === factory.track_units_per_leg.length - 1) {
      factory.way_points.push(factory.all_points[count]);
      factory.way_pts_indexes.push(count);
    }
  }
  console.log('     *')
  console.log('  **** 1) first way points')
  console.log('  legs_per_day :>> ', factory.legs_per_day);
  console.log(`  all_points.length`, factory.all_points.length)
  console.log(`  num_units`, factory.num_units)
  console.log(`  num_legs_float`, factory.num_legs_float)
  console.log(`  num_legs`, factory.num_legs)
  console.log('  units_per_leg_float :>> ', factory.units_per_leg_float);
  console.log('  units_per_leg :>> ', factory.units_per_leg);
  console.log(`  leftovers`, factory.leftovers);
  console.log('should be equal to num_units :>> ', factory.leftovers + (factory.num_legs * factory.units_per_leg));
  console.log(`meters/leg * legs/day = ${(factory.meters_per_leg * factory.legs_per_day) / 1609.34} mi/day`);
  console.log('  way_points.length', factory.way_points.length);
  console.log(`  way_pts_indexes.length`, factory.way_pts_indexes.length)
  console.log(`  way_pts_indexes`, factory.way_pts_indexes)
  console.log('  track_units_per_leg.length :>> ', factory.track_units_per_leg.length);
  console.log('  track_units_per_leg :>> ', factory.track_units_per_leg);
  console.log('  meters_per_leg :>> ', factory.meters_per_leg);
  console.log('  target_points.length :>> ', factory.target_points.length);
  console.log('  target_points :>> ', factory.target_points);
  console.log('     **** End 1)     *');
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
      setupTargets(req)
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