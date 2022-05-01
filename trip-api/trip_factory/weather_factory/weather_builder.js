const { fetchDataOWM } = require('./requestToOWM')
const { fetchDataNOAA } = require('./requestToNOAA')
const { beginAllPointForecasts } = require('./mergeDataOWM')
const { addToNodeForecast } = require('./mergeDataNOAA')
const { fixMissingData } = require('./checkScrapeNOAA')

const getWeather = (req, res, next) => {
  return fetchDataOWM(req, res, next)
    .then(dataOWM => {
      beginAllPointForecasts(dataOWM, req);
      return fetchDataNOAA(req, res, next)
        .then(dataNOAA => {
          addToNodeForecast(dataNOAA, req);
          // repair missing data bc NOAA api is unreliable
          return fixMissingData(req, res, next)
        })
    })
    .catch(function (error) {
      console.log(error);
    })
}

module.exports = {
  getWeather
}
