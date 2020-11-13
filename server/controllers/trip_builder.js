const { setupDataStructure, isValidTripInput } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')
const { createTripPath } = require('./trip_path')
const { createTimePoints } = require('./time_points')
const { getAllWeatherData } = require('./weather')
const { createMatrix } = require('./matrix')

function build_trip(req, res, next) {
  if (!isValidTripInput(req)) {
    // don't know how to handle errors in middleware context :(
    // so do nothing for now
    // next({ message: 'Invalid or missing trip input' });
  }
  setupDataStructure(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next);
    })
    .then(req => {
      createTripPath(req, res, next);
      // add times and locations along route
      createTimePoints(req, res, next);

      return getAllWeatherData(req, res, next);
    })
    // .then(req => {
    //    // if user wants services (hotels, truck stops), 
    //    // gather extra nearby way points for
    //    // search purposes
    //   if (Object.keys(req.trip.services).length !== 0) {
    //     getExtraWayPoints(req, res, next)
    //     searchForServicesSet(req, res, next)
    //   } 
    // return req; 
    // })  

    .then(req => {
      return createMatrix(req, res, next)
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = {
  build_trip
}

