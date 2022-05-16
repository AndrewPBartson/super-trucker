const axios = require('axios');
// const OWMkey = process.env.owmKey;
const OWMkey = '50568570360fbfb7ecdb0fc8679e4500';

function createUrlsOWM(req) {
  req.factory.urls_OWM = [];
  let url;
  for (let i = 0; i < req.factory.way_points.length; i++) {

    url =
      `https://api.openweathermap.org/data/2.5/onecall?lat=${req.factory.way_points[i][0]}&lon=${req.factory.way_points[i][1]}&exclude=current,hourly,minutely&units=imperial&appid=${OWMkey}`;
    req.factory.urls_OWM.push(url);
  }
}

const sendRequestsOWM = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.factory.way_points.length; i++) {
    promisesArray.push(axios.get(req.factory.urls_OWM[i]))
  }
  // return raw data for all requests
  return Promise.all(promisesArray);
}

const fetchDataOWM = (req, res, next) => {
  createUrlsOWM(req)
  return sendRequestsOWM(req, res, next)
}

module.exports = {
  fetchDataOWM
}