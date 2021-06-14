const { createTripOverview, setupTripFactory, setupPayload } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')
const { getWeatherData } = require('./weather_factory/weather')
const { createNodes } = require('./trip_nodes')
const { createTimePoints } = require('./time_points')
const { nailPointTimeData, finalizePayload } = require('./final_merge')

function build_trip(req, res, next) {
  createTripOverview(req, res, next);
  setupTripFactory(req, res, next);
  setupPayload(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next)
        .then(req => {
          // refactor - save nodes, weather, time_points to factory
          createNodes(req, res, next);
          // get 7-day forecasts for each node
          return getWeatherData(req, res, next)
            .then(req => {
              // add times for locations along route
              createTimePoints(req, res, next);
              /*** refactor
               * createDays(req, res, next); 
               * integrate createDays() with nailPointTimeData()
              */
              // add weather data for specific time_point for each location
              nailPointTimeData(req, res, next);
              return finalizePayload(req, res, next);
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
