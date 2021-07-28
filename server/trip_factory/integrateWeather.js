const {
  getTimeForTimezone,
  getOtherTimeForTimezone,
  formatTime,
  formatDateLong,
  formatDateShort
} = require('./utilities');

const setDateTimeLocal = (time_pt, timestampObj) => {
  // local timezone for place on route
  let local_str = getTimeForTimezone(timestampObj, time_pt.timezone_local);
  time_pt.date_time_local = local_str;
  time_pt.time_local = formatTime(local_str);
  time_pt.date_local_long = formatDateLong(local_str);
  // get alternate format for date - 2-digit e.g. 6/17
  time_pt.date_local =
    formatDateShort(getOtherTimeForTimezone(timestampObj, time_pt.timezone_local));
}

const setDateTimeUserHome = (time_pt, timestampObj, tz_user) => {
  // user home timezone
  let user_str = getTimeForTimezone(timestampObj, tz_user)
  time_pt.date_time_user = user_str;
  time_pt.time_user = formatTime(user_str);
  time_pt.date_user_long = formatDateLong(user_str);
  time_pt.date_user =
    formatDateShort(getOtherTimeForTimezone(timestampObj, tz_user));
}

const create12HourForecast = (time_pt, weather, idx) => {
  // NOAA forecasts in 12 hour increments
  for (let y = 0; y < weather[idx].forecast12hour.length; y++) {
    time_pt.weather.hasOWMData = weather[idx].hasOWMData;
    time_pt.weather.hasNOAAData = weather[idx].hasNOAAData;
    time_pt.weather.hasNOAAHtml = weather[idx].hasNOAAHtml;
    time_pt.weather.hasBlend = null; //weather[idx].hasBlend;
    // match forecast period to ETA for this location
    if (time_pt.timestamp >= weather[idx].forecast12hour[y].start_12
      && time_pt.timestamp < weather[idx].forecast12hour[y].end_12) { // save to time_point
      time_pt.weather.forecast12hour = weather[idx].forecast12hour[y];
    }
  }
}

const create24HourForecast = (time_pt, weather, idx) => {
  // OWM forecasts in 24 hour increments... mostly
  for (let z = 0; z < weather[idx].forecast24hour.length; z++) {
    // match forecast period to ETA for this location
    if (time_pt.timestamp >= weather[idx].forecast24hour[z].start_24
      && time_pt.timestamp < weather[idx].forecast24hour[z].end_24) {
      // save to time_point
      time_pt.weather.forecast24hour = weather[idx].forecast24hour[z];
      // OWM temperature comes in 6 hour increments
      for (let a = 0; a < weather[idx].forecast24hour[z].temps.length; a++) {
        // pull temperature for this timestamp and save to time_point
        if (time_pt.timestamp >= weather[idx].forecast24hour[z].temps[a].start
          && time_pt.timestamp < weather[idx].forecast24hour[z].temps[a].end) {
          time_pt.weather.temperature = weather[idx].forecast24hour[z].temps[a].temp;
          time_pt.weather.temperature_time_check = weather[idx].forecast24hour[z].temps[a].name;
        }
      }
    }
  }
}

const assignWeatherToTime = (req, res, next) => {
  let weather = req.factory.weather;
  let time_points = req.factory.time_points;
  let tz_user = req.payload.data.trip.overview.timezone_user;
  let timestampObj;
  let idx; // index for weather[]
  // idx is needed because weather.length !== time_points.length

  for (let x = 0; x < time_points.length; x++) {
    idx = time_points[x].weather_idx;
    timestampObj = new Date(time_points[x].timestamp);
    // save status of NOAA request/promise - rejected or fulfilled
    time_points[x].weather.status = weather[idx].statusNOAA;

    setDateTimeLocal(time_points[x], timestampObj)
    setDateTimeUserHome(time_points[x], timestampObj, tz_user)

    // each time_point has index for weather data for that location which
    // is weather data set: 7 days NOAA forecasts, 8 days OWM forecasts
    create12HourForecast(time_points[x], weather, idx)
    create24HourForecast(time_points[x], weather, idx)
  }
}

const fillMissingWeather = () => {
  // 
  console.log('fillMissingWeather() working')
}

const integrateWeather = (req, res, next) => {
  assignWeatherToTime(req, res, next)
  fillMissingWeather()
  return req;
}

module.exports = {
  integrateWeather
}