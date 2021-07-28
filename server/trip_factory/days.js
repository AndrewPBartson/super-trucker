const {
  testWeatherDates,
  checkTimeStrings,
  checkDistanceDuration,
  checkDataSources
} = require('./devDataCheck');

const createDaysArray = (req, res, next) => {
  let time_points = req.factory.time_points;
  let days = req.payload.data.trip.days;
  let emptyDay;
  let day_count = 0;

  for (let i = 0; i < time_points.length; i++) {
    if (time_points[i].status === "start_trip" || time_points[i].status === "start_day") {
      // start new day - add element to days[]
      emptyDay = {
        time_points: [],
        totals: {}
      }
      days.push(emptyDay);
    }
    if (time_points[i].status === "start_day") {
      day_count++;
    }
    if (time_points[i].status === "end_day" || time_points[i].status === "end_trip") {
      days[day_count].totals.miles_today = time_points[i].miles_today;
      days[day_count].totals.hours_today = time_points[i].hours_today;
    }
    // add time_point to time_points[] of current day
    days[day_count].time_points.push(time_points[i])
  }
  // testWeatherDates(days);
  checkTimeStrings(days, req.payload.data.trip.overview.timezone_user);
  // checkDistanceDuration(days, req.payload.data.trip.overview);
  // checkDataSources(days);

  return req;
}

module.exports = {
  createDaysArray
}


