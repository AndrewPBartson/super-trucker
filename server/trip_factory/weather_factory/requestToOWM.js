const axios = require('axios');
const keys = require('../../../config/keys');

function createUrlsOWM(req) {
  req.factory.urls_OWM = [];
  let url;
  for (let i = 0; i < req.factory.way_points.length; i++) {

    url =
      'https://api.openweathermap.org/data/2.5/onecall?lat='
      + req.factory.way_points[i][0] + '&lon='
      + req.factory.way_points[i][1]
      + '&exclude=minutely,hourly&units=imperial&appid='
      + keys.OWMkey;
    req.factory.urls_OWM.push(url);
  }
  console.log('req.factory.urls_OWM.length :>> ', req.factory.urls_OWM.length);
}

const sendRequestsOWM = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.factory.way_points.length; i++) {
    promisesArray.push(axios.get(req.factory.urls_OWM[i]))
  }
  return Promise.all(promisesArray);
}

const fetchDataOWM = (req, res, next) => {
  createUrlsOWM(req)
  return sendRequestsOWM(req, res, next)
}

module.exports = {
  fetchDataOWM
}