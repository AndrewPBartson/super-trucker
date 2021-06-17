const { getTimeForTimezone } = require('./utilities');

function viewFactoryReport(factory) {
  console.log(`
      ******************** Trip Factory Report ****************
      total_meters -  ${factory.total_meters}
      meters_per_day -  ${factory.meters_per_day}
      length of second leg -  ${factory.leg_distances[1]}
      total miles -  ${factory.total_meters / 1609.34}
      all_points.length -  ${factory.all_points.length}  
      meter_counts.length -  ${factory.meter_counts.length}
      num_segments -  ${factory.num_segments}
      way_points :
        ${factory.way_points}
      way_points.length -  ${factory.way_points.length}
      leg_distances.length -  ${factory.leg_distances.length}
      num_legs -  ${factory.num_legs}
      num_legs_round -  ${factory.num_legs_round}
      segments_per_leg -  ${factory.segments_per_leg}
      segments_per_leg_round -  ${factory.segments_per_leg_round}
      'leftover' segments -  ${factory.leftovers}
      ${factory.segments_per_leg_round}  *  ${factory.num_legs_round - 1}  +  ${factory.leftovers}  =  ${factory.num_segments}
      ******************************************************
   `)
  return factory;
}

const calcTotals = (params) => {
  let dayTotals = {
    miles_today: 2,
    hours_today: 3,

    day_start_time: 123,
    day_start_meters: 456
  }
  return dayTotals;
}

const createDaysArray = (req, res, next) => {
  // viewFactoryReport(req.factory);
  let { nodes, weather } = req.factory;
  let time_points = req.factory.time_points;
  let days = req.payload.data.trip.days;
  let tz_user = req.payload.data.trip.overview.timezone_user;
  let timestamp;
  let local_str;
  let user_str;
  let timestampObj;
  let testString;
  let emptyDay;
  let dayTotals = {};
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
    // add time_point to time_points[] of current day
    days[day_count].time_points.push(time_points[i])
    if (time_points[i].status === "end_day" || time_points[i].status === "end_trip") {
      // end of day - calculate totals
      dayTotals = {
        miles_today: 2,
        hours_today: 3,
        day_start_time: 123,
        day_start_meters: 456
      }
      days[day_count].totals = dayTotals;
    }
  }
}

const finalizePayload = (req, res, next) => {
  console.log('finalizePayload() working!')
  // to do: remove duplicate data used during development:
  // payload.time_points
  // payload.weather
  // nodes.time_points.cityName
  return req;
}

module.exports = {
  createDaysArray,
  finalizePayload
}


