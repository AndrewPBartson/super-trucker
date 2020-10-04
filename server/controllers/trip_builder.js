const { setupDataStructure, isValidTripInput } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { getWeatherForecasts } = require('./weather')
const { searchForServicesSet } = require('./services')
const { createSchedule } = require('./schedule')
const { createMatrix } = require('./matrix')
const { createTripOutline } = require('./trip_outline')

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

function build_trip(req, res, next) { // 1
  if (!isValidTripInput(req)) {
    // don't understand how to handle errors in middleware context :(
    // so don't do anything for now
    // next({ message: 'Invalid or missing trip input' });
  }
  setupDataStructure(req, res, next)
  return getInitialTripData(req, res, next)
    .then(req => { // 2
      return fixWayPoints(req, res, next) 
        // .then(req => { // 3
        //   return getWeatherForecasts(req, res, next)

        //    // get extra nearby way points, to search for more services
        //     // if (Object.keys(req.trip.services).length !== 0) {
        //     //   getExtraWayPoints(req, res, next)
        //     //   searchForServicesSet(req, res, next)
        //     // }
        //     .then(req => { // 4
        //       getPlaceNames(req, res, next)
        // createTestUrl(req.trip)  
        // createSchedule(req, res, next) 
        // createMatrix(req, res, next)       
        .then(req => {  // 5
          req.completeTrip = createTripOutline(req, res, next)
          return req;
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