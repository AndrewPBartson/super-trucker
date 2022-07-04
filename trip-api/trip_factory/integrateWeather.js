const moment = require('moment-timezone');

const setDatesAndTimes = (time_pt, timezone_city) => {
  // dates & times for local timezone for place on route
  let date_obj_local = moment.tz(time_pt.timestamp, time_pt.timezone_local)
  time_pt.date_local = date_obj_local.format("ddd, MMM D");
  time_pt.date_local_short = date_obj_local.format("MMM D");
  time_pt.date_local_long = date_obj_local.format("dddd, MMMM D");
  time_pt.time_local = date_obj_local.format("h:mm A");
  // dates and times for user timezone from UI input or browser default
  let date_obj_user = moment.tz(time_pt.timestamp, timezone_city)
  time_pt.date_user = date_obj_user.format("ddd, MMM D");
  time_pt.time_user = date_obj_user.format("h:mm a");
}

const select24HourForecast = (time_pt, weather, idx) => {
  // OWM forecasts in 24 hr increments, except temp in 6 hr increments
  for (let z = 0; z < weather[idx].forecast24hour.length; z++) {
    // match forecast period to ETA for this location
    if (time_pt.timestamp >= weather[idx].forecast24hour[z].start_24
      && time_pt.timestamp < weather[idx].forecast24hour[z].end_24) {
      // save to time_point
      time_pt.weather.forecast24hour = weather[idx].forecast24hour[z];
      time_pt.text = time_pt.weather.forecast24hour.text24;
      time_pt.icon = time_pt.weather.forecast24hour.icon_OWM;

      for (let a = 0; a < weather[idx].forecast24hour[z].temps.length; a++) {
        // OWM temperature comes in 6 hour increments
        // pull temperature for this timestamp and save to time_point
        if (time_pt.timestamp >= weather[idx].forecast24hour[z].temps[a].start
          && time_pt.timestamp < weather[idx].forecast24hour[z].temps[a].end) {
          time_pt.temperature = weather[idx].forecast24hour[z].temps[a].temp;
          time_pt.weather.temperature_time_check = weather[idx].forecast24hour[z].temps[a].name;
        }
      }
    }
  }
}

const select12HourForecast = (time_pt, weather, idx) => {
  if (weather[idx].forecast12hour.length > 0) {
    for (let y = 0; y < weather[idx].forecast12hour.length; y++) {
      // match forecast period to ETA for this location
      if (time_pt.timestamp >= weather[idx].forecast12hour[y].start_12
        && time_pt.timestamp < weather[idx].forecast12hour[y].end_12) {
        time_pt.weather.forecast12hour = weather[idx].forecast12hour[y];
        time_pt.text = weather[idx].forecast12hour[y].text12short;
        // icon_NOAA can be null for scraped data like 6 days out
        if (time_pt.weather.forecast12hour.icon_NOAA) {
          time_pt.icon = time_pt.weather.forecast12hour.icon_NOAA;
        }
      }
      if (!time_pt.icon) {
        time_pt.icon = '../../assets/images/nodata.jpg';
      }
    }
  }
}

const copyWeatherMetadata = (time_pt, weather, idx) => {
  time_pt.weather.hasOWMData = weather[idx].hasOWMData;
  time_pt.weather.hasNOAAData = weather[idx].hasNOAAData;
  time_pt.weather.hasNOAAHtml = weather[idx].hasNOAAHtml;
}
/*
  each time_points[] element represents a specific location at specific time.
  after time_points are built, next step is add weather data.
  For happy path, weather data includes:
  6.5 or 7 days NOAA forecasts, 8 days OWM forecasts.
  applicable data is added to a time_point in three steps
  1) add metadata for location, not timestamped 
  2) select just one 12 hour forecast that applies to this location at ETA 
      - iterate through 7 days of 12 hour forecasts 
      - compare time_point ETA to start and end time
      - find forecast that matches              
  3) select just one 24 hour forecast that applies to this location at ETA 
      - iterate through 7 days of 24 hour forecasts, etc
*/
const addWeatherToTimePts = (req, res, next) => {
  let { weather, time_points, overview } = req.payload.data.trip;
  let timezone_city = overview.timezone_city;
  let idx; // index for weather[]
  // idx is needed because, for multi-day trips,
  // time_points.length > weather.length

  for (let x = 0; x < time_points.length; x++) {
    idx = time_points[x].weather_idx;
    setDatesAndTimes(time_points[x], timezone_city);
    copyWeatherMetadata(time_points[x], weather, idx);
    select24HourForecast(time_points[x], weather, idx);
    select12HourForecast(time_points[x], weather, idx);
  }
  return req;
}

module.exports = {
  addWeatherToTimePts
}