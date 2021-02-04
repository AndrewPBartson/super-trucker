const { setupTripStructure, isValidTripInput } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')
const { getWeatherData } = require('./weather')
const { createTripPath } = require('./trip_path')
const { createTimePoints } = require('./time_points')
const { nailPointTimeData } = require('./final_merge')

function build_trip(req, res, next) {
  if (!isValidTripInput(req)) {
    // coming not very soon!
  }
  setupTripStructure(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next)
        .then(req => {
          // get weather forecasts for way_points
          return getWeatherData(req, res, next)

            // .then(req => {
            //   // if user wants services (hotels, truck stops)
            //   if (req.trip.services.hotels || req.trip.services.truck_stops) {
            //     // gather extra nearby way points for search purposes
            //     getExtraWayPoints(req, res, next)
            //     //return searchForServicesSet(req, res, next)
            //   }
            //   return req;
            // })

            .then(req => {
              createTripPath(req, res, next);
              // add times for locations along route -
              createTimePoints(req, res, next);
              return nailPointTimeData(req, res, next);
            })
        })
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = {
  build_trip
}

