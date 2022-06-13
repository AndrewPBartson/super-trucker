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
*/
const calcTotalLegsMax = (total_meters) => {
  // prevent showing too many weather reports over short distance 
  if (total_meters > 1062167) {  // 660+ mi
    return 23;
  }
  else if (between(total_meters, 1013887, 1062167)) { // 630 - 660 miles
    return 22;
  }
  else if (between(total_meters, 965606, 1013887)) { // 600 - 630 miles
    return 21;
  }
  else if (between(total_meters, 917326, 965606)) { // 570 - 600 miles
    return 20;
  }
  else if (between(total_meters, 869046, 917326)) { // 540 - 570 miles
    return 19;
  }
  else if (between(total_meters, 820765, 869046)) { // 510 - 540 miles
    return 18;
  }
  else if (between(total_meters, 772485, 820765)) { // 480 - 510 miles
    return 17;
  }
  else if (between(total_meters, 724205, 772485)) { // 450 - 480 miles
    return 16;
  }
  else if (between(total_meters, 675924, 724205)) { // 420 - 450 miles
    return 15;
  }
  else if (between(total_meters, 627644, 675924)) { // 390 - 420 miles
    return 14;
  }
  else if (between(total_meters, 579364, 627644)) { // 360 - 390 miles
    return 13;
  }
  else if (between(total_meters, 531084, 579364)) { // 330 - 360 miles
    return 12;
  }
  else if (between(total_meters, 482803, 531084)) { // 300 - 330 miles
    return 11;
  }
  else if (between(total_meters, 434523, 482803)) { // 270 - 300 miles
    return 10;
  }
  else if (between(total_meters, 386243, 434523)) { // 240 - 270 miles
    return 9;
  }
  else if (between(total_meters, 337962, 386243)) { // 210 - 240 miles
    return 8;
  }
  else if (between(total_meters, 289682, 337962)) { // 180 - 210 miles
    return 7;
  }
  else if (between(total_meters, 241402, 289682)) { // 150 - 180 miles
    return 6;
  }
  else if (between(total_meters, 193121, 241402)) { // 120 - 150 miles
    return 5;
  }
  else if (between(total_meters, 144841, 193121)) { // 90 - 120 miles
    return 4;
  }
  else if (between(total_meters, 96561, 144841)) { // 60 - 90 miles
    return 3;
  }
  else if (between(total_meters, 48280, 96561)) { // 30 - 60 miles
    return 2;
  }
  else if (between(total_meters, 0, 48280)) { // 0 - 30 miles
    return 1;
  }
  else return 23;
}

function getSimpleData(req, prelim_data) {
  req.factory.total_meters = prelim_data.routes[0].legs[0].distance.value;
  req.payload.data.trip.overview.total_meters = prelim_data.routes[0].legs[0].distance.value;
  req.payload.data.trip.overview.total_mi_text = prelim_data.routes[0].legs[0].distance.text;
  req.payload.data.trip.overview.bounds.northeast.lat = prelim_data.routes[0].bounds.northeast.lat;
  req.payload.data.trip.overview.bounds.northeast.lng = prelim_data.routes[0].bounds.northeast.lng;
  req.payload.data.trip.overview.bounds.southwest.lat = prelim_data.routes[0].bounds.southwest.lat;
  req.payload.data.trip.overview.bounds.southwest.lng = prelim_data.routes[0].bounds.southwest.lng;
  // convert Gmaps trip summary polyline to array of lat/lng coordinates
  let polylinePts = prelim_data.routes[0].overview_polyline.points;
  req.factory.all_points = polyline.decode(polylinePts);
  req.payload.data.trip.polyline = req.factory.all_points;
  // subtract 1 bc number of distances is always one less than number of places:
  req.factory.total_units = req.factory.all_points.length - 1;
}

// const showFirstVersionData = (factory) => {

//   console.log('     *')
//   console.log('   ***  1st way points')
//   console.log(`   all_points.length         `, factory.all_points.length)
//   console.log(`   total_units               `, factory.total_units)
//   console.log('   meters_per_day            ', factory.meters_per_day);
//   console.log('   days (more if late start) ', factory.total_meters / factory.meters_per_day);
//   console.log('   legs_per_day              ', factory.legs_per_day);
//   console.log(`   total_legs_float          `, factory.total_legs_float)
//   console.log(`   total_legs                `, factory.total_legs)
//   console.log('   meters_per_leg            ', factory.meters_per_leg);
//   console.log('   miles per leg             ', factory.meters_per_leg / 1609.34);
//   console.log('   units_per_leg_float       ', factory.units_per_leg_float);
//   console.log('   units_per_leg             ', factory.units_per_leg);
//   console.log(`   meters/leg * legs/day =    ${(factory.meters_per_leg * factory.legs_per_day) / 1609.34} mi/day`);
//   console.log('   way_points.length         ', factory.way_points.length);
//   console.log(`   way_pts_indexes.length    `, factory.way_pts_indexes.length)
//   console.log(`   way_pts_indexes           `, factory.way_pts_indexes)
//   console.log('   track_units_per_leg.length ', factory.track_units_per_leg.length);
//   console.log('   track_units_per_leg       ', factory.track_units_per_leg);
//   let track_units = 0;
//   for (let i = 0; i < factory.track_units_per_leg.length; i++) {
//     track_units += factory.track_units_per_leg[i];
//   }
//   console.log('   sum of track_units     ', track_units);
//   console.log('   targets.length   ', factory.targets.length);
//   console.log('   targets          ', factory.targets);
//   console.log('     ***  1st version  Done!   *');
//   console.log('     *')
// }

// const showFirstTripVariables = (factory) => {
//   console.log('   ***  1st trip variables');
//   console.log(`   total_meters`, factory.total_meters)
//   console.log(`   total miles`, factory.total_meters / 1609.34)
//   console.log('   total_legs_max :>> ', factory.total_legs_max);
//   console.log('   legs_per_day :>> ', factory.legs_per_day);
//   console.log('   meters_per_leg :>> ', factory.meters_per_leg);
//   console.log('   total_legs_float :>> ', factory.total_legs_float);
//   console.log('   units_per_leg_float :>> ', factory.units_per_leg_float);
//   console.log('   units_per_leg :>> ', factory.units_per_leg);
// }

const initializeTargets = (req) => {
  /* 
  // each target is a meter count at ideal location for each way_point
  //    so that route is divided into nearly equal distances (legs)
  */
  let running_total = 0;
  let calcsObj = {};
  for (let i = 0; i < req.factory.way_points.length; i++) {
    req.factory.targets.push(Math.round(running_total));
    running_total += req.factory.meters_per_leg;
  }
}

const calcFirstTrackUnits = (factory) => {
  // build initial version of track_units_per_leg array
  // each element is number of units for current leg
  let running_total = 0;
  let numberShortOrOver = (factory.total_legs * factory.units_per_leg) - factory.total_units;
  let bumpSign = numberShortOrOver > 0 ? -1 : 1;
  let bumpMax = Math.abs(Math.round(factory.total_legs / numberShortOrOver));
  let bumpCount = 0;
  let current_step;
  for (let i = 0; i < factory.total_legs; i++) {
    current_step = factory.units_per_leg;
    // adjust current_step so total stays close to total_units
    if (bumpCount >= bumpMax) {
      current_step += (1 * bumpSign);
      bumpCount = 0;
    }
    running_total += current_step;
    if (i === factory.total_legs - 1) {
      // adjust last step so total comes out equal to total_units
      current_step += factory.total_units - running_total;
    }
    // push number of units for current leg
    factory.track_units_per_leg.push(current_step);
    bumpCount++;
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
  /*
   these calculations take into account that number of legs per day needs to be an integer
   and all legs should be close to same length, except final leg of trip can be shorter. 
   The length of legs needs to be such that -
   number of legs * meters_per_leg = meters_per_day (set by user as miles per day) 
  */
  factory.total_legs_max = calcTotalLegsMax(factory.total_meters);
  let meters_per_leg_est = factory.total_meters / factory.total_legs_max;
  let legs_per_day_est = factory.meters_per_day / meters_per_leg_est
  factory.legs_per_day = Math.floor(legs_per_day_est);
  factory.meters_per_leg = factory.meters_per_day / factory.legs_per_day;
  factory.total_legs_float = factory.total_meters / factory.meters_per_leg;
  factory.total_legs = Math.round(factory.total_legs_float);
  // calculate number of units that should be in each leg if
  // units were all same length
  factory.units_per_leg_float = factory.total_units / factory.total_legs_float
  // convert units_per_leg_float to int for iteration
  factory.units_per_leg = Math.round(factory.units_per_leg_float);
  calcFirstTrackUnits(factory);
}

function calcFirstWayPoints(factory) {
  // Select index of an all_point (point from polyline) that
  // is best guess for next way_point based solely on
  // indexes, no geo-data
  // later spacing of way_points is adjusted to be as even as possible
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
      // showFirstTripVariables(req.factory)
      calcFirstWayPoints(req.factory)
      initializeTargets(req)
      // showFirstVersionData(req.factory)
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