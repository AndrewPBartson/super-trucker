const addSnapshot12 = (pointNOAA) => {
  // NOAA data is in 12 hour increments
  let snapshot = {
    // example of pointNOAA.startTime - "2022-04-23T06:00:00-05:00"
    // start_12 and end_12 seem to be correct time in msec
    "start_12": Date.parse(pointNOAA.startTime),
    "end_12": Date.parse(pointNOAA.endTime),
    "temperature": pointNOAA.temperature,
    "windSpeed": pointNOAA.windSpeed,
    "icon_NOAA": pointNOAA.icon,
    "text12short": pointNOAA.shortForecast,
    "text12": pointNOAA.detailedForecast
  }
  return snapshot;
}

const create12hourForecasts = (dataNOAA) => {
  let forecast12hour = [];
  // if NOAA api returns data for this location -
  if (dataNOAA.status === "fulfilled") {
    // build weather data set consisting of data for 13 or 14 12-hour periods -
    for (let i = 0; i < dataNOAA.value.data.properties.periods.length; i++) {
      forecast12hour.push(addSnapshot12(dataNOAA.value.data.properties.periods[i]))
    }
    // else - status === "rejected"
    // leave forecast12hour[] empty until
    // data is obtained from other source -
    // plan b - add data scraped from NOAA html
    // plan c - reformat data from OWM into 12 hour periods etc
  }
  return forecast12hour;
}

const addLocationMetadata = (point_data, pointDataNOAA, city) => {
  point_data.hasNOAAData = point_data.forecast12hour.length !== 0;
  point_data.statusNOAA = pointDataNOAA.status;
  if (point_data.statusNOAA === "rejected") {
    point_data.city_2noaa = city + ', rejected';
  }
  else {
    point_data.city_2noaa = city + ', fulfilled';
  }
}

const addToNodeForecast = (nodeDataNOAA, req) => {
  let { weather, cities } = req.payload.data.trip;
  // for each item (location) in weather[], add 7-day forecast from NOAA
  for (let i = 0; i < weather.length; i++) {
    // console.log('NOAA promise[' + i + '] :>> ', nodeDataNOAA[i].status);
    // create set of 13 or 14 12-hour forecasts for current location
    weather[i].forecast12hour = (create12hourForecasts(nodeDataNOAA[i]));
    addLocationMetadata(weather[i], nodeDataNOAA[i], cities[i]);
  }
}

module.exports = {
  addToNodeForecast
}
