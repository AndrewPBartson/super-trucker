// OWM date/time comes back in milliseconds,
// multiply by 1000 to convert to seconds
const addSnapshot24 = (pointOWM) => {
  // OWM data is in 24 hour increments except
  // temperature which is in 6 hour increments
  let snapshot = {
    "start": (pointOWM.dt * 1000) - 43200000,
    "end": (pointOWM.dt * 1000) + 43200000,
    "text24short": pointOWM.weather[0].main,
    "text24": pointOWM.weather[0].description,
    "icon_OWM": 'http://openweathermap.org/img/wn/' + pointOWM.weather[0].icon + '@2x.png',
    "min": Math.round(pointOWM.temp.min),
    "max": Math.round(pointOWM.temp.max),
    "wind_speed": Math.round(pointOWM.wind_speed),
    "clouds": pointOWM.clouds,
    "ppt": pointOWM.pop,
    "rain_amt": pointOWM.rain,
    "snow_amt": pointOWM.snow,
    "sunrise": pointOWM.sunrise * 1000,
    "sunset": pointOWM.sunset * 1000,
    "noon": pointOWM.dt * 1000,
    "temps": [
      // 'name' property for testing, remove for production
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

// OWM provides timezone, prevents additional api call!
// fix timezone given by OWM
const formatTimezoneOWM = (timezone_raw) => {
  let tz_new = (timezone_raw / 36);
  tz_new = tz_new.toString();
  // usually need to add leading zero: -700 becomes -0700
  if (tz_new.length === 4) {
    tz_new = tz_new.slice(0, 1) + '0' + tz_new.slice(1)
  }
  tz_new = "GMT" + tz_new.slice(0, 3) + ':' + tz_new.slice(3);
  return tz_new;
}

const AddPointForecastOWM = (dataOWM) => {
  // initialize set of weather forecasts for one node
  // prefer to initialize here because timezone is from OWM
  let weather = {
    // save local timezone in weather object
    // later local tz will be in time_point object but time_points don't exist yet. 
    "timezone_local_str": dataOWM.data.timezone,
    "timezone_local": formatTimezoneOWM(dataOWM.data.timezone_offset),
    "forecast24hour": [],
    "forecast12hour": [],
    "statusNOAA": ""
  }
  for (let i = 0; i < dataOWM.data.daily.length; i++) {
    weather.forecast24hour.push(addSnapshot24(dataOWM.data.daily[i]));
  }
  return weather;
}

const injectDataOWM = (dataOWM, req) => {
  for (let i = 0; i < dataOWM.length; i++) {
    // add OWM data to req.factory
    req.factory.weather.push(AddPointForecastOWM(dataOWM[i]));
    // optional - add OWM data to payload for testing
    req.payload.data.trip.weather.push(AddPointForecastOWM(dataOWM[i]));
  }
  return req;
}

module.exports = {
  injectDataOWM
}