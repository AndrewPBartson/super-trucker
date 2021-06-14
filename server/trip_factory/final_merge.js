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

const formatTime = (dateTime) => {
  let timeStr = dateTime.slice(dateTime.length - 8);
  if (timeStr[0] === '0') {
    timeStr = timeStr.slice(1)
  }
  return timeStr;
}

const formatDateLong = (dateTime) => {
  let dateStr = dateTime.slice(0, dateTime.length - 10);
  return dateStr;
}

const formatDate = (dateObj) => {
  let dateStr = (dateObj.getMonth() + 1) + '/' + dateObj.getDate();
  return dateStr;
}

const logTestString = (testString, node, x) => {
  testString = node.time_points[x].time_user + '  =>  '
    + node.time_points[x].status + '  =>  '
    + node.cityState;
  if (node.next_leg) {
    testString += '  =>  ' + node.next_leg.duration.text;
  }
  console.log(testString);
}

// previous step - store all weather forecasts for all nodes in payload
// next select and save relevant weather data for timestamp(s) in each node: 
const nailPointTimeData = (req, res, next) => {
  // viewFactoryReport(req.factory);

  let { nodes, weather } = req.payload.data.trip;
  let tz_user = req.payload.data.trip.overview.timezone_user;
  let timestamp;
  let local_str;
  let user_str;
  let timestampObj;
  let testString;

  for (let k = 0; k < nodes.length; k++) {
    if (weather[k]) {
      nodes[k].timezone_local = weather[k].timezone_local;
      nodes[k].timezone_local_str = weather[k].timezone_local_str;
    }
    // loop through time_points for this node (has 1 or 2 time_points)
    for (let x = 0; x < nodes[k].time_points.length; x++) {
      timestamp = nodes[k].time_points[x].timestamp;
      timestampObj = new Date(timestamp);
      // create date/time strings for 1) local timezone 2) user home timezone
      local_str = getTimeForTimezone(timestampObj, nodes[k].timezone_local);
      user_str = getTimeForTimezone(timestampObj, tz_user)
      nodes[k].time_points[x].date_time_local = local_str;
      nodes[k].time_points[x].date_time_user = user_str;
      nodes[k].time_points[x].time_local = formatTime(local_str);
      nodes[k].time_points[x].time_user = formatTime(user_str);
      nodes[k].time_points[x].date_local_long = formatDateLong(local_str);
      nodes[k].time_points[x].date_user_long = formatDateLong(user_str);
      nodes[k].time_points[x].date_local = formatDate(timestampObj);
      nodes[k].time_points[x].date_user = formatDate(timestampObj);
      // Check overall accuracy =>
      logTestString(testString, nodes[k], x);
      // each node has set of weather forecasts (7 days of NOAA data, 8 days of OWM data)
      // loop through set of multi-day weather forecasts (NOAA and OWM) for this node 
      for (let j = 0; j < weather.length; j++) {
        // loop through NOAA weather forecasts (12 hour increments)
        for (let y = 0; y < weather[j].forecast12hour.length; y++) {
          // pull out NOAA data for this time_point and copy to node
          if (timestamp >= weather[j].forecast12hour[y].start
            && timestamp < weather[j].forecast12hour[y].end) {
            nodes[k].time_points[x].weather.forecast12hour = weather[j].forecast12hour[y];
          }
        }
        // loop through OWM weather forecasts (24 hour increments)
        for (let z = 0; z < weather[j].forecast24hour.length; z++) {
          // pull out OWM data for this time_point and copy to node
          if (timestamp >= weather[j].forecast24hour[z].start
            && timestamp < weather[j].forecast24hour[z].end) {
            nodes[k].time_points[x].weather.forecast24hour = weather[j].forecast24hour[z];
            // OWM temperature comes in 6 hour increments
            for (let a = 0; a < weather[j].forecast24hour[z].temps.length; a++) {
              // pull out OWM temperature for this timestamp and copy to node
              if (timestamp >= weather[j].forecast24hour[z].temps[a].start
                && timestamp < weather[j].forecast24hour[z].temps[a].end) {
                nodes[k].time_points[x].weather.temperature = weather[j].forecast24hour[z].temps[a].temp;
                nodes[k].time_points[x].weather.temperature_time_check = weather[j].forecast24hour[z].temps[a].name;
              }
            }
          }
        }
      }
    }
  }
  return req;
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
  nailPointTimeData,
  finalizePayload
}


