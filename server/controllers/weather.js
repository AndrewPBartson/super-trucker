const axios = require('axios');
const keys = require('../../config/keys');

function createUrlsNOAA(req) {
  req.grid_pts_urls = [];
  let url;
  for (let i = 0; i < req.trip.way_points.length; i++) {
    url =
      'https://api.weather.gov/points/'
      + req.trip.way_points[i][0] + ','
      + req.trip.way_points[i][1];
    req.grid_pts_urls.push(url);
  }
}

let getPointNOAA = function (url) {
  return axios.get(url)
    .then(point => {
      let weatherUrl = point.data.properties.forecast
      return axios.get(weatherUrl)
    })
}

let sendRequestsNOAA = function (req, res, next) {
  let promisesArray = []
  for (let i = 0; i < req.trip.way_points.length; i++) {
    promisesArray.push(getPointNOAA(req.grid_pts_urls[i]))
  }
  return Promise.allSettled(promisesArray);
}

function getDataNOAA(req, res, next) {
  createUrlsNOAA(req)
  return sendRequestsNOAA(req, res, next)
}

function createUrlsOWM(req) {
  req.urls_OWM = [];
  let url;
  for (let i = 0; i < req.trip.way_points.length; i++) {
    url =
      'https://api.openweathermap.org/data/2.5/onecall?lat='
      + req.trip.way_points[i][0] + '&lon='
      + req.trip.way_points[i][1]
      + '&exclude=minutely,hourly&units=imperial&appid='
      + keys.OWMkey;
    req.urls_OWM.push(url);
  }
}

const sendRequestsOWM = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.trip.way_points.length; i++) {
    promisesArray.push(axios.get(req.urls_OWM[i]))
  }
  return Promise.all(promisesArray);
}

const getDataOWM = (req, res, next) => {
  createUrlsOWM(req)
  return sendRequestsOWM(req, res, next)
}

const addSnapshot24 = (pointOWM) => {
  let snapshot = {
    "start": (pointOWM.dt * 1000) - 43200000,
    "end": (pointOWM.dt * 1000) + 43200000,
    "text24short": pointOWM.weather[0].main,
    "text24": pointOWM.weather[0].description,
    "icon_OWM": 'http://openweathermap.org/img/wn/' + pointOWM.weather[0].icon + '@2x.png',
    "min": Math.round(pointOWM.temp.min),
    "max": Math.round(pointOWM.temp.max),
    "wind_speed": pointOWM.wind_speed,
    "clouds": pointOWM.clouds,
    "ppt": pointOWM.pop,
    "rain_amt": pointOWM.rain,
    "snow_amt": pointOWM.snow,
    "sunrise": pointOWM.sunrise * 1000,
    "sunset": pointOWM.sunset * 1000,
    "noon": pointOWM.dt * 1000,
    "temps": [
      {
        "start": (pointOWM.dt * 1000) - 43200000,
        "end": (pointOWM.dt * 1000) - 32400000,
        "name": "night_12_3am",
        // incorrect - add night temp from previous day as night_am
        "temp": Math.round(pointOWM.temp.night)
      },
      {
        "start": (pointOWM.dt * 1000) - 32400000,
        "end": (pointOWM.dt * 1000) - 10800000,
        "name": "morn_3_9am",
        "temp": Math.round(pointOWM.temp.morn)
      },
      {
        "start": (pointOWM.dt * 1000) - 10800000,
        "end": (pointOWM.dt * 1000) + 10800000,
        "name": "day_9am_3pm",
        "temp": Math.round(pointOWM.temp.day)
      }, {
        "start": (pointOWM.dt * 1000) + 10800000,
        "end": (pointOWM.dt * 1000) + 32400000,
        "name": "eve_3_9pm",
        "temp": Math.round(pointOWM.temp.eve)
      },
      {
        "start": (pointOWM.dt * 1000) + 32400000,
        "end": (pointOWM.dt * 1000) + 43200000,
        "name": "night_9pm_12am",
        "temp": Math.round(pointOWM.temp.night)
      }
    ]
  }
  return snapshot;
}

const AddPointForecastOWM = (dataOWM) => {
  let weather = {
    "timezone_local": dataOWM.data.timezone,
    "timezone_id_local": dataOWM.data.timezone_offset / 36,
    "forecast24hour": [],
    "forecast12hour": [],
    "statusNOAA": ""
  }
  for (let i = 0; i < dataOWM.data.daily.length; i++) {
    weather.forecast24hour.push(addSnapshot24(dataOWM.data.daily[i]));
  }
  return weather;
}

const addSnapshot12 = (pointNOAA) => {
  let snapshot = {
    "start": Date.parse(pointNOAA.startTime),
    "end": Date.parse(pointNOAA.endTime),
    "isDaytime": pointNOAA.isDaytime,
    "temperature": pointNOAA.temperature,
    "windSpeed": pointNOAA.windSpeed,
    "icon_NOAA": pointNOAA.icon,
    "text12short": pointNOAA.shortForecast,
    "text12": pointNOAA.detailedForecast
  }
  return snapshot;
}
const AddPointForecastNOAA = (dataNOAA) => {
  let forecast12hour = [];
  if (dataNOAA.status === "fulfilled") {
    for (let i = 0; i < dataNOAA.value.data.properties.periods.length; i++) {
      forecast12hour.push(addSnapshot12(dataNOAA.value.data.properties.periods[i]))
    }
  }
  return forecast12hour;
}

const getWeatherData = (req, res, next) => {
  return getDataOWM(req, res, next)
    .then(dataOWM => {
      for (let i = 0; i < dataOWM.length; i++) {
        req.trip.weather.push(AddPointForecastOWM(dataOWM[i]));
      }
      return getDataNOAA(req, res, next)
        .then(dataNOAA => {
          for (let i = 0; i < dataNOAA.length; i++) {
            console.log('dataNOAA[i].status :>> ', dataNOAA[i].status);
            req.trip.weather[i].statusNOAA = dataNOAA[i].status;
            req.trip.weather[i].forecast12hour = (AddPointForecastNOAA(dataNOAA[i]));
          }
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
