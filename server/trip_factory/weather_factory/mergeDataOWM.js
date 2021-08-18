const { capitalize1stChar } = require('../utilities');
/* 
  OWM data - 
    - is in 24 hour increments
    - except temperature is in 6 hour increments
    - date/time is in milliseconds
    - multiply by 1000 to convert to seconds
*/
const assignIcon = (code) => {
  const icons = {
    '200': 'https://www.weather.gov/images/nws/newicons/sn.png', // thunderstorm with light rain
    '201': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm with rain
    '202': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm with heavy rain
    '210': 'https://www.weather.gov/images/nws/newicons/tsra.png', // light thunderstorm
    '211': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm
    '212': 'https://www.weather.gov/images/nws/newicons/tsra.png', // heavy thunderstorm
    '221': 'https://www.weather.gov/images/nws/newicons/tsra.png', // ragged thunderstorm	
    '230': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm with light drizzle
    '231': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm with drizzle
    '232': 'https://www.weather.gov/images/nws/newicons/tsra.png', // thunderstorm with heavy drizzle
    '300': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // light intensity drizzle
    '301': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // drizzle
    '302': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // heavy intensity drizzle
    '310': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // light intensity drizzle rain
    '311': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // drizzle rain
    '312': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // heavy intensity drizzle rain
    '313': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // shower rain and drizzle
    '314': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // heavy shower rain and drizzle
    '321': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // shower drizzle
    '500': 'https://www.weather.gov/images/nws/newicons/minus_ra.png', // light rain
    '501': 'https://www.weather.gov/images/nws/newicons/ra.png', // moderate rain
    '502': 'https://www.weather.gov/images/nws/newicons/ra.png', // heavy intensity rain
    '503': 'https://www.weather.gov/images/nws/newicons/ra.png', // very heavy rain
    '504': 'https://www.weather.gov/images/nws/newicons/ra.png', // extreme rain
    '511': 'https://www.weather.gov/images/nws/newicons/shra.png', // freezing rain
    '520': 'https://www.weather.gov/images/nws/newicons/shra.png', // light intensity shower rain
    '521': 'https://www.weather.gov/images/nws/newicons/shra.png', // shower rain
    '522': 'https://www.weather.gov/images/nws/newicons/shra.png', // heavy intensity shower rain
    '531': 'https://www.weather.gov/images/nws/newicons/shra.png', // ragged shower rain
    '600': 'https://www.weather.gov/images/nws/newicons/sn.png', // light snow
    '601': 'https://www.weather.gov/images/nws/newicons/sn.png', // Snow
    '602': 'https://www.weather.gov/images/nws/newicons/sn.png', // Heavy snow
    '611': 'https://www.weather.gov/images/nws/newicons/raip.png', // Sleet
    '612': 'https://www.weather.gov/images/nws/newicons/raip.png', // Light shower sleet
    '613': 'https://www.weather.gov/images/nws/newicons/raip.png', // Shower sleet
    '615': 'https://www.weather.gov/images/nws/newicons/ra_sn.png', // Light rain and snow
    '616': 'https://www.weather.gov/images/nws/newicons/ra_sn.png', // Rain and snow
    '620': 'https://www.weather.gov/images/nws/newicons/sn.png', // Light shower snow
    '621': 'https://www.weather.gov/images/nws/newicons/sn.png', // Shower snow
    '622': 'https://www.weather.gov/images/nws/newicons/sn.png', // Heavy shower snow
    '701': 'https://www.weather.gov/images/nws/newicons/fg.png', // mist
    '711': 'https://www.weather.gov/images/nws/newicons/fu.png', // Smoke
    '721': 'https://www.weather.gov/images/nws/newicons/hz.png', // Haze
    '731': 'https://www.weather.gov/images/nws/newicons/du.png', // sand/ dust whirls
    '741': 'https://www.weather.gov/images/nws/newicons/fg.png', // fog
    '751': 'https://www.weather.gov/images/nws/newicons/du.png', // sand
    '761': 'https://www.weather.gov/images/nws/newicons/du.png', // dust
    '762': 'https://www.weather.gov/images/nws/newicons/du.png', // volcanic ash
    '771': 'https://www.weather.gov/images/nws/newicons/wind_few.png', // squalls
    '781': 'https://www.weather.gov/images/nws/newicons/tor.png', // tornado
    '800': 'https://www.weather.gov/images/nws/newicons/skc.png', // clear sky
    '801': 'https://www.weather.gov/images/nws/newicons/few.png', // few clouds 11-25%
    '802': 'https://www.weather.gov/images/nws/newicons/sct.png', // scattered clouds 25-50%
    '803': 'https://www.weather.gov/images/nws/newicons/bkn.png', // broken clouds 51-84%
    '804': 'https://www.weather.gov/images/nws/newicons/ovc.png'  // overcast clouds 85-100%
  }
  return icons[code];
}

const addSnapshot24 = (pointOWM) => {
  let snapshot = {
    "start_24": (pointOWM.dt * 1000) - 43200000,
    "end_24": (pointOWM.dt * 1000) + 43200000,
    "text24short": pointOWM.weather[0].main,
    "text24": capitalize1stChar(pointOWM.weather[0].description),
    "icon_OWM": assignIcon('' + pointOWM.weather[0].id),
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

const addForecastObjectOWM = (dataOWM) => {
  // initialize set of weather forecasts for one node
  // prefer to initialize here because timezone is from OWM
  let node_weather = {
    // save local timezone in node_weather{}
    // later local tz will be in time_points[x] when time_points exist 
    "timezone_local_str": dataOWM.data.timezone,
    "timezone_local": formatTimezoneOWM(dataOWM.data.timezone_offset),
    "forecast24hour": [],
    "forecast12hour": [],
    "statusNOAA": "none",
    "hasOWMData": (dataOWM.data.daily.length !== 0)
  }
  for (let i = 0; i < dataOWM.data.daily.length; i++) {
    node_weather.forecast24hour.push(addSnapshot24(dataOWM.data.daily[i]));
  }
  node_weather.hasOWMData = node_weather.forecast24hour.length !== 0
  return node_weather;
}

const saveDataOWM = (req, dataOWM) => {
  let weather = req.payload.data.trip.weather
  for (let i = 0; i < dataOWM.length; i++) {
    weather.push(addForecastObjectOWM(dataOWM[i]));
  }
  return req;
}

module.exports = {
  saveDataOWM
}