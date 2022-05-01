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

const addSnapshot24 = (pointOWM, previousPointOWM) => {
  // each snapshot is one of 8 daily forecasts for a location
  let verifiedNightTemp;
  // for first day of forecast, previousPointOWM is null
  if (previousPointOWM) {
    verifiedNightTemp = previousPointOWM.temp.night;
  } else {
    // missing, just use next night temp
    // minor issue - for the time period of day[0] midnight to 3 am
    // night temp will be incorrect but is unlikely to be included in 
    // final forecast. That's because most trips are not planned and actually
    // get underway within the three hour period after midnight. 
    // Even in that case, the night temp will usually seem reasonable.
    verifiedNightTemp = pointOWM.temp.night;
  }

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
      // 'name' = time period for which temp is valid
      {
        "start": (pointOWM.dt * 1000) - 43200000,
        "end": (pointOWM.dt * 1000) - 32400000,
        "name": "night_12_3am",
        // add night temp from previous day due to OWM being weird
        "temp": Math.round(verifiedNightTemp)
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
      /*
        43200000 = 12 hours
        32400000 = 9 hours
        10800000 = 3 hours
      */
    ]
  }
  return snapshot;
}

// fix timezone given by OWM
// to-do: explain entire situation around timezones, 
// what comes from user and how that is fixed
// what comes from OWM and how that is fixed
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

const initializePointDataObject = () => {
  // initialize set of weather forecasts for one node
  // prefer to initialize here because timezone is from OWM
  let point_data_empty = {
    // save local timezone in point_data{}
    // later local tz will be in time_points[x] when time_points exist 
    "timezone_local_str": "",
    "timezone_local": "",
    "forecast24hour": [],
    "forecast12hour": [],
    "statusNOAA": "none",
    "hasNOAAData": null,
    "hasOWMData": null,
    "icon": null,
    "icon_best": null,
    "icon_ok": null,
    "textNoData": null,
    // city name and/or status is added or updated each time data is added
    // it's helpful for validating/debugging
    "city_1owm": "", // city name for OWM api data
    "city_2noaa": "", // city name for NOAA api data
    "city_3noaa": "" // city name for NOAA html data
  }
  return point_data_empty;
}

const create24hourForecasts = (nodeDataOWM) => {
  let forecast24hour = [];
  let previous_day = null;
  for (let i = 0; i < nodeDataOWM.data.daily.length; i++) {
    if (i !== 0) {
      previous_day = nodeDataOWM.data.daily[i - 1];
    }
    forecast24hour.push(addSnapshot24(nodeDataOWM.data.daily[i], previous_day));
  }
  return forecast24hour;
}

const addLocationMetadata = (point_data, nodeDataOWM, city) => {
  point_data.timezone_local_str = nodeDataOWM.data.timezone;
  point_data.timezone_local = formatTimezoneOWM(nodeDataOWM.data.timezone_offset);
  point_data.hasOWMData = nodeDataOWM.data.daily.length !== 0;
  point_data.city_1owm = city;
  if (point_data.hasOWMData) {
    point_data.city_1owm += ', has OWM data';
  } else {
    point_data.city_1owm += ', Fail! no OWM data';
  }
}

const buildPointForecastOWM = (nodeDataOWM, cityIndex, req) => {
  let point_data = initializePointDataObject();
  point_data.forecast24hour = create24hourForecasts(nodeDataOWM);
  addLocationMetadata(point_data, nodeDataOWM, cityIndex, req);
  return point_data;
}

const beginAllPointForecasts = (dataOWM, req) => {
  let { weather, cities } = req.payload.data.trip;
  // create array of weather data sets, one element for each location
  for (let i = 0; i < dataOWM.length; i++) {
    weather.push(buildPointForecastOWM(dataOWM[i], cities[i], req));
  }
}

module.exports = {
  beginAllPointForecasts
}