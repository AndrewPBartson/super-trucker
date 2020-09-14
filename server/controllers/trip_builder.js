const { setupDataStructure, isValidTripInput } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { recalculateWayPoints, getExtraWayPoints } = require('./waypoints')
const { getPlaceNames } = require('./place_names')
const { getWeatherForecasts } = require('./weather')
const { searchForServicesSet } = require('./services')
const { createSchedule } = require('./schedule')
const { createMatrix } = require('./matrix')

function createTestUrl(trip) {
  // creates a normal url (not to API) for checking way points
  let { way_points } = trip
  trip.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < trip.way_points.length; i++) {
    trip.test_url += trip.way_points[i];
    trip.test_url += '/';
  }
  trip.test_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  trip.exports.test_url = trip.test_url
  return trip
}

function loadResponseData(req, res, next) {
  //if (req.trip.exports) {
    console.log(`loadResponseData() check for req.trip -> req :  ${req}`);
    req.trip.exports.way_points = req.trip.way_points;
    req.trip.exports.way_points_set = req.trip.way_points_set;
    req.trip.exports.response = req.trip.response;
 // }
  next();
}

function build_trip(req, res, next) { // 1
  console.log(`
              *** in trip_builder.build_trip() ***`)
  if (!isValidTripInput(req)) {
    // don't understand how to handle errors in middleware context :(
    // so don't do anything for now
    // next({ message: 'Invalid or missing trip input' });
  }
  setupDataStructure(req, res, next)
  return getInitialTripData(req, res, next)
    .then(req => { // 2
      return recalculateWayPoints(req, res, next)
        // .then(req => { // 3
        //   return getWeatherForecasts(req, res, next)

        //     //         // get extra nearby way points, to search for more services
        //     //         if (Object.keys(req.trip.services).length !== 0) {
        //     //   getExtraWayPoints(req, res, next)
        //     //   searchForServicesSet(req, res, next)
        //     // }
        //     .then(req => { // 4
        //       getPlaceNames(req, res, next)
        // createTestUrl(req.trip)  
        //createSchedule(req, res, next) 
        //createMatrix(req, res, next)       
        .then(req => {  // 5
          
          // loadResponseData(req, res, next);
          // console.log('now sending response - req.trip.exports :', req.trip.exports);
          res.json({"ok": "not ok"})
        }) // 5
        //     })  // 4
        // }) // 3
        .catch(err => {
          console.log(err);
        });
    }) // 2
}  // 1
module.exports = {
  build_trip
}