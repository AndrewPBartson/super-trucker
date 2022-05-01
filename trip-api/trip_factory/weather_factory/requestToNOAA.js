const axios = require('axios');

function createUrlsNOAA(req) {
  req.factory.urls_NOAA = [];
  let url_NOAA_prelim;
  for (let i = 0; i < req.factory.way_points.length; i++) {
    url_NOAA_prelim =
      `https://api.weather.gov/points/${req.factory.way_points[i][0]},${req.factory.way_points[i][1]}`;
    req.factory.urls_NOAA.push(url_NOAA_prelim);
  }
}

let getPointNOAA = function (url) {
  // part 1 - axios call to get url for part 2
  return axios.get(url)
    .then(point => {
      let url_NOAA_final = point.data.properties.forecast
      console.log('url_NOAA_final :>> ', url_NOAA_final);
      // part 2 - real axios call to NOAA api - bring home the bacon
      return axios.get(url_NOAA_final)
    })
}

let sendRequestsNOAA = function (req, res, next) {
  let promisesArray = []
  for (let i = 0; i < req.factory.way_points.length; i++) {
    promisesArray.push(getPointNOAA(req.factory.urls_NOAA[i]))
  }
  // return raw data for all requests
  return Promise.allSettled(promisesArray);
}

const fetchDataNOAA = (req, res, next) => {
  createUrlsNOAA(req)
  return sendRequestsNOAA(req, res, next)
}

module.exports = {
  fetchDataNOAA
}