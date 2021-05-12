const { setupForCalculations, setupPayload } = require('./trip_input')
const { getInitialTripData } = require('./first_version')
const { fixWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')
const { getWeatherData } = require('./weather_factory/weather')
const { createNodes } = require('./trip_nodes')
const { createTimePoints } = require('./time_points')
const { nailPointTimeData, finalizePayload } = require('./final_merge')

function build_trip(req, res, next) {
  setupForCalculations(req, res, next);
  setupPayload(req, res, next);
  return getInitialTripData(req, res, next)
    .then(req => {
      return fixWayPoints(req, res, next)
        .then(req => {
          createNodes(req, res, next);
          // get 7-day forecasts for each way_point
          return getWeatherData(req, res, next)
            .then(req => {
              // add times for locations along route
              createTimePoints(req, res, next);
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

            // .then(req => {
            //   // if user wants services (hotels, truck stops)
            //   if (req.factory.overview.services.hotels || req.factory.overview.services.truck_stops) {
            //     // gather extra nearby way points for search purposes
            //     getExtraWayPoints(req.factory)
            //     //return searchForServicesSet(req, res, next)
            //   }
            //   return req;
            // })

              // const fetchURL = (url) => axios.get(url);
  // const promiseArray = weather_urls.map(fetchURL);


  // .then(req => {
  //   return new Promise(resolve => {
  //     resolve(req);
  // })
  // })


// return new Promise(function(resolve, reject) {
//   resolve(getAllWeatherData(req, res, next));
// })


