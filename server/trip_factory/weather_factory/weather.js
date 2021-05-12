const { fetchDataOWM } = require('./requestToOWM')
const { fetchDataNOAA } = require('./requestToNOAA')
const { injectDataOWM } = require('./mergeDataOWM')
const { injectDataNOAA } = require('./mergeDataNOAA')

const getWeatherData = (req, res, next) => {
  return fetchDataOWM(req, res, next)
    .then(dataOWM => {
      injectDataOWM(dataOWM, req);
      return fetchDataNOAA(req, res, next)
        .then(dataNOAA => {
          injectDataNOAA(dataNOAA, req);
          return req;
        })
    })
    .catch(function (error) {
      console.log(error);
    })
}

module.exports = {
  getWeatherData
}
