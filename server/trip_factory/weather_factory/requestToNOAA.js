const axios = require('axios');
const keys = require('../../../config/keys');

function createUrlsNOAA(req) {
  req.factory.urls_NOAA = [];
  let url_NOAA_prelim;
  for (let i = 0; i < req.factory.way_points.length; i++) {
    url_NOAA_prelim =
      'https://api.weather.gov/points/'
      + req.factory.way_points[i][0] + ','
      + req.factory.way_points[i][1];
    req.factory.urls_NOAA.push(url_NOAA_prelim);
  }
  console.log('req.factory.urls_NOAA.length :>> ', req.factory.urls_NOAA.length);
  console.log('req.factory.way_points.length :>> ', req.factory.way_points.length);
}

let getPointNOAA = function (url) {
  return axios.get(url)
    .then(point => {
      let url_NOAA_final = point.data.properties.forecast
      return axios.get(url_NOAA_final)
    })
}

let sendRequestsNOAA = function (req, res, next) {
  let promisesArray = []
  for (let i = 0; i < req.factory.way_points.length; i++) {
    promisesArray.push(getPointNOAA(req.factory.urls_NOAA[i]))
  }
  return Promise.allSettled(promisesArray);
}

const fetchDataNOAA = (req, res, next) => {
  createUrlsNOAA(req)
  return sendRequestsNOAA(req, res, next)
}

module.exports = {
  fetchDataNOAA
}
