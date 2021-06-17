const { createTripOverview, setupTripFactory, setupPayload } = require('./first_setup');
const { getInitialTripData } = require('./first_version');
const { fixWayPoints, getExtraWayPoints } = require('./waypoints');
const { searchForServicesSet } = require('./services');
const { getWeather } = require('./weather_factory/weather');
const { createNodes } = require('./nodes');
const { createTimePoints, sortWeatherData } = require('./time_points');
const { createDaysArray, finalizePayload } = require('./days');

function build_trip(req, res, next) {
  setupPayload(req, res, next);
  createTripOverview(req, res, next);
  setupTripFactory(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next)
        .then(req => {
          createNodes(req, res, next);
          // get 7-day forecasts for each node
          return getWeather(req, res, next)
            .then(req => {
              // calculate times for locations along route
              createTimePoints(req, res, next);
              // find relevant weather for each time_point
              sortWeatherData(req, res, next);
              // group time_points into a series of days
              createDaysArray(req, res, next);
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
