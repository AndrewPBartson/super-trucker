const {
   secondsToTimeString,
   getTimeForTimezone,
   getTimeForTimezone2,
   formatTime,
   formatDateLong,
   formatDateShort
} = require('./utilities');

function pushTimePoint(req, next_data, idx) {
   let { nodes, time_points, weather } = req.factory;
   time_points.push({
      city_state: nodes[idx].cityState,
      latLng: nodes[idx].latLng,
      next_leg: nodes[idx].next_leg,
      status: next_data.status,
      timestamp: next_data.timer,
      miles_today: next_data.miles_today,
      hours_today: next_data.hours_today,
      timezone_local: weather[idx].timezone_local,
      timezone_local_str: weather[idx].timezone_local_str,
      weather_idx: idx,
      weather: {}
   })
}

function setNextStartTime(end_time, drive_time_msec, midnight) {
   let start_time;
   // if driving period is less than 14 hours
   if (drive_time_msec < 50400000) {
      if (end_time + 36000000 > midnight + 21600000) {
         // console.log(`Restart time - Option 1)
         //    drive_time_msec < hours_14 && end_time + hours_10 > midnight + hours_6`);
         start_time = end_time + 36000000;
      } else {
         // console.log(`Restart time - Option 2)
         //    drive_time_msec < hours_14 && end_time + hours_10 <= midnight + hours_6`);
         start_time = midnight + 21600000;
      }
   } // drive period more than 14 hours & drive period < 
   else if (drive_time_msec >= 50400000 && drive_time_msec < 28800000) {
      if (end_time + (86400000 - drive_time) < midnight + 21600000) {
         // console.log(`Restart time - Option 3)
         //    drive_time_msec >= hours_14 && drive_time_msec < hours_18 && end_time + (hours_24 - drive_time) < midnight + hours_6`);
         start_time = end_time + (86400000 - drive_time_msec);
      } else {
         // console.log(`Restart time - Option 4)
         //    drive_time_msec >= hours_14 && drive_time_msec < hours_18  && end_time + (hours_24 - drive_time) > midnight + hours_6`);
         start_time = midnight + 21600000;
      }
   } else {
      // console.log(`Option 5)
      //    drive_time_msec > hours_18`);
      start_time = midnight + (86400000 - drive_time_msec);
   }
   return start_time;
}

const calcNextMidnight = (start_time, timezone) => {
   let midnight = new Date(start_time);
   midnight.setHours(0);
   midnight.setMinutes(0);
   midnight.setSeconds(0);
   midnight.setMilliseconds(0);
   let midnight_improved = midnight.getTime();
   // convert to next midnight
   midnight_improved += 86400000;
   return midnight_improved;
}

const adjustTripStartTime = (start_time, break_period, next_leg_msec, midnight) => {
   let fixed_start_time;
   if (start_time + next_leg_msec < midnight) {
      fixed_start_time = start_time;
   } else { // edge case - start time is too close to midnight,
      // delay start time until midnight plus break_period
      if (break_period < 21600000) { fixed_start_time = midnight + break_period; }
      // delay start time until next morning at 6:00 am
      else { fixed_start_time = midnight + 21600000; }
   }
   return fixed_start_time;
}

const logTestString = (testString, time_point) => {
   testString = time_point.time_user + '  =>  '
      + time_point.status + '  =>  '
      + time_point.cityState;
   if (time_point.next_leg) {
      testString += '  =>  ' + time_point.next_leg.duration.text;
   }
   console.log(testString);
}
/* 
let hours_6 = 21600000
let hours_10 = 36000000
let hours_12 = 43200000
let hours_14 = 50400000
let hours_18 = 28800000
let hours_24 = 86400000
*/

function createTimePoints(req, res, next) {
   let nodes = req.factory.nodes;
   // next_data holds data for next time_point
   let next_data = {
      timer: null, // accumulator for each drive time and/or break period
      status: '',  // start_trip, start_day, enroute, end_day, end_trip
      miles_today: null,
      hours_today: null
   }
   let { start_time, break_period, drive_time_msec, timezone_user, intervals_per_day } = req.payload.data.trip.overview;
   let midnight = calcNextMidnight(start_time, timezone_user);
   next_data.timer = adjustTripStartTime(start_time, break_period, nodes[0].next_leg.duration.msec, midnight);
   //  increment midnight to next day if needed
   if (midnight < next_data.timer) {
      midnight += 86400000;
   }
   let day_start_time = next_data.timer;
   // vars for calculating start time for next day
   let end_time, next_start_time, rest_stop_msec;

   for (let node_count = 0,
      day_count = 0,
      current_meters = 0,
      day_start_meters = 0,
      interval_count = 0;
      node_count < nodes.length;) {
      next_data.status = "";
      if (node_count === 0) { // first time_point, first node
         // don't add to running totals
         next_data.status = "start_trip";
         pushTimePoint(req, next_data, node_count)
         node_count++;
      } else { // not first node
         // add just completed drive time and distance to running totals
         if (!(node_count === nodes.length - 1)) { // if not last node of trip
            // if not done driving for the day, and if enough time for next interval before midnight
            if (interval_count < intervals_per_day &&
               next_data.timer + nodes[node_count - 1].next_leg.duration.msec + nodes[node_count].next_leg.duration.msec < midnight) {
               next_data.status = "enroute";
               // add just completed drive time and distance to running totals
               next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               interval_count++;
               pushTimePoint(req, next_data, node_count)
               node_count++;
            }
            else { // rest stop - done driving for the day, not end of trip
               // rest stop, part 1 - create 1st time point at this location - "end_day"
               next_data.status = "end_day";
               // add just completed drive time and distance to running totals
               next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               interval_count++;
               next_data.miles_today = Math.round((current_meters - day_start_meters) * 0.000621371)
                  + ' miles'
               next_data.hours_today = secondsToTimeString((next_data.timer - day_start_time) / 1000);
               pushTimePoint(req, next_data, node_count)
               // rest stop, part 2 - create 2nd time point at this location - "start_day"
               // layover at same node so
               // don't increment nodes, don't add distance to current_meters
               end_time = next_data.timer;
               next_start_time = setNextStartTime(end_time, drive_time_msec, midnight)
               // get number of milliseconds between end_time and next_start_time
               rest_stop_msec = next_start_time - end_time;
               // increment midnight to next day:
               midnight += 86400000;
               next_data.status = "start_day";
               next_data.timer += rest_stop_msec;
               interval_count = 0; // begin first driving period of new day
               day_count++;
               next_data.miles_today = null;
               next_data.hours_today = null;
               day_start_meters = current_meters;
               day_start_time = next_data.timer;
               pushTimePoint(req, next_data, node_count)
               node_count++ // now leaving this node in the morning
            }
         } else {  // if last node of trip
            next_data.status = "end_trip";
            // add just completed drive time and distance to running totals
            next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
            current_meters += nodes[node_count - 1].next_leg.distance.meters;
            interval_count++;
            next_data.miles_today = Math.round((current_meters - day_start_meters) * 0.000621371) + ' miles'
            next_data.hours_today = secondsToTimeString((next_data.timer - day_start_time) / 1000);
            pushTimePoint(req, next_data, node_count)
            node_count++;
         }
      }
   }
   return req;
}

const sortWeatherData = (req, res, next) => {
   let weather = req.factory.weather;
   let time_points = req.factory.time_points;
   let tz_user = req.payload.data.trip.overview.timezone_user;
   let timestamp;
   let local_str;
   let user_str;
   let local_str2;
   let user_str2;
   let timestampObj;
   let testString;
   let idx;

   for (let x = 0; x < time_points.length; x++) {
      timestamp = time_points[x].timestamp;
      timestampObj = new Date(timestamp);
      idx = time_points[x].weather_idx;
      // local timezone
      local_str = getTimeForTimezone(timestampObj, time_points[x].timezone_local);
      time_points[x].date_time_local = local_str;
      time_points[x].time_local = formatTime(local_str);
      time_points[x].date_local_long = formatDateLong(local_str);
      // get alternate format for date - 2-digit e.g. 6/17
      local_str_2 = getTimeForTimezone2(timestampObj, time_points[x].timezone_local);
      time_points[x].date_local = formatDateShort(local_str_2);
      // user home timezone
      user_str = getTimeForTimezone(timestampObj, tz_user)
      time_points[x].date_time_user = user_str;
      time_points[x].time_user = formatTime(user_str);
      time_points[x].date_user_long = formatDateLong(user_str);
      user_str_2 = getTimeForTimezone2(timestampObj, tz_user)
      time_points[x].date_user = formatDateShort(user_str_2);

      logTestString(testString, time_points[x]);

      // save status of NOAA request/promise - rejected or fulfilled
      time_points[x].weather.status = weather[idx].statusNOAA;
      // each time_point has index for weather data for that location 
      // which is a set of weather forecasts (7 days NOAA data, 8 days OWM data)
      for (let y = 0; y < weather[idx].forecast12hour.length; y++) {
         // NOAA weather forecasts in 12 hour increments
         // pull data for this timestamp and save to time_point 
         if (timestamp >= weather[idx].forecast12hour[y].start
            && timestamp < weather[idx].forecast12hour[y].end) {
            time_points[x].weather.forecast12hour = weather[idx].forecast12hour[y];
         }
      }
      for (let z = 0; z < weather[idx].forecast24hour.length; z++) {
         // OWM weather forecasts in 24 hour increments
         // pull data for this timestamp and save to time_point
         if (timestamp >= weather[idx].forecast24hour[z].start
            && timestamp < weather[idx].forecast24hour[z].end) {
            time_points[x].weather.forecast24hour = weather[idx].forecast24hour[z];
            // OWM temperature comes in 6 hour increments
            for (let a = 0; a < weather[idx].forecast24hour[z].temps.length; a++) {
               // pull temperature for this timestamp and save to time_point
               if (timestamp >= weather[idx].forecast24hour[z].temps[a].start
                  && timestamp < weather[idx].forecast24hour[z].temps[a].end) {
                  time_points[x].weather.temperature = weather[idx].forecast24hour[z].temps[a].temp;
                  time_points[x].weather.temperature_time_check = weather[idx].forecast24hour[z].temps[a].name;
               }
            }
         }
      }
   }
}

module.exports = {
   createTimePoints,
   sortWeatherData
}
