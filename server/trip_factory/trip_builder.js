const { setupPayload, createTripOverview, setupTripFactory } = require('./first_setup');
const { getInitialTripData } = require('./first_version');
const { fixWayPoints, getExtraWayPoints } = require('./waypoints');
const { searchForServicesSet } = require('./services');
const { createNodes } = require('./nodes');
const { getWeather } = require('./weather_factory/weather_builder');
const { createTimePoints } = require('./time_points');
const { integrateWeather } = require('./integrateWeather');
const { createDaysArray } = require('./days');
const { reviewWaypointCalcs } = require('./devDataCheck');

function build_trip(req, res, next) {
  setupPayload(req, res, next);
  createTripOverview(req, res, next);
  setupTripFactory(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next)
        .then(req => {
          // reviewWaypointCalcs(req.factory);
          createNodes(req, res, next);
          // get 7-day forecasts for each node
          return getWeather(req, res, next)
            .then(req => {
              // calculate times for locations along route
              createTimePoints(req, res, next);
              // find relevant weather for each time_point
              integrateWeather(req, res, next);
              // allocate each time_point to a day
              return createDaysArray(req, res, next);
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
