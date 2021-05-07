const { isValidTripInput, setupForCalculations, setupPayload } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')
const { getWeatherData } = require('./weather')
const { createNodes } = require('./trip_nodes')
const { createTimePoints } = require('./time_points')
const { nailPointTimeData } = require('./final_merge')

function build_trip(req, res, next) {
  if (!isValidTripInput(req)) {
    // coming not very soon!
  }
  setupForCalculations(req, res, next);
  setupPayload(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {

      return fixWayPoints(req, res, next)

        .then(req => {
          // get 7-day forecasts for each way_point
          // console.log(' 1 - req.factory.way_points.length :>> ', req.factory.way_points.length);
          return getWeatherData(req, res, next)

            // .then(req => {
            //   // if user wants services (hotels, truck stops)
            //   if (req.factory.overview.services.hotels || req.factory.overview.services.truck_stops) {
            //     // gather extra nearby way points for search purposes
            //     getExtraWayPoints(req.factory)
            //     //return searchForServicesSet(req, res, next)
            //   }
            //   return req;
            // })

            .then(req => {
              // console.log(' 2 - req.factory.way_points.length :>> ', req.factory.way_points.length);
              createNodes(req, res, next);

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

