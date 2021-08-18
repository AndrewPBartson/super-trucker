const { fetchDataOWM } = require('./requestToOWM')
const { fetchDataNOAA } = require('./requestToNOAA')
const { saveDataOWM } = require('./mergeDataOWM')
const { saveDataNOAA } = require('./mergeDataNOAA')
const { checkDataNOAA } = require('./checkDataNOAA')
const { recordDataSource } = require('./dataSources')

const getWeather = (req, res, next) => {
  return fetchDataOWM(req, res, next)
    .then(dataOWM => {
      saveDataOWM(req, dataOWM);
      return fetchDataNOAA(req, res, next)
        .then(dataNOAA => {
          saveDataNOAA(dataNOAA, req.payload.data.trip.weather);
          // repair missing data bc NOAA api is unreliable
          return checkDataNOAA(req, res, next)
          // .then(dataNOAA => {
          //   // create data_source variable for 12 hour forecast
          //   // not needed for production
          //   recordDataSource(req, res, next)
          //   return req;
          // })
        })
    })
    .catch(function (error) {
      console.log(error);
    })
}

module.exports = {
  getWeather
}
