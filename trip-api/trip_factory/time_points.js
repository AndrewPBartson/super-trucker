const { secondsToHoursStr, calcMidnight } = require('./utilities');

const adjustTripStartTime = (start_time, break_period, next_leg_msec, midnight) => {
   // check for edge case - beginning of trip is too close to midnight
   let updated_start_time;
   if (start_time + next_leg_msec < midnight) {
      // start time doesn't need to be adjusted
      updated_start_time = start_time;
   } else { // if start time is close to midnight
      // assume most people don't want to start a trip by driving all night
      // therefore begin trip in the morning.
      if (break_period < 21600000) { // if break period < 6 hours
         // delay start time until midnight plus break_period
         updated_start_time = midnight + break_period;
      }
      else { // if break period > 6 hours
         // assume drivers who take breaks longer than 6 hours 
         // prefer to begin their trip at 6:00 am.
         // set start time for next morning at 6:00 am
         updated_start_time = midnight + 21600000;
      }
   }
   return updated_start_time;
}

function pushTimePoint(req, next_data, idx) {
   let { nodes } = req.factory;
   let weather = req.payload.data.trip.weather;
   let { time_points } = req.payload.data.trip;
   if (idx < weather.length) {
      time_points.push({
         city_state: nodes[idx].cityState,
         latLng: nodes[idx].latLng,
         next_leg: nodes[idx].next_leg,
         status: next_data.status,
         timestamp: next_data.timer,
         miles_today: next_data.miles_today,
         hours_today: next_data.hours_today,
         rest_hours: next_data.rest_hours,
         timezone_local: weather[idx].timezone_local,
         timezone_local_str: weather[idx].timezone_local_str,
         weather_idx: idx,
         weather: {}
      })
   }
}

function setNextStartTime(end_time, drive_time_msec, midnight) {
   let start_time;
   // if driving period is less than 14 hours
   if (drive_time_msec < 50400000) {
      if (end_time + 36000000 > midnight + 21600000) {
         // console.log(`Restart time - Option 1)
         //     drive_time_msec < hours_14 && end_time + hours_10 > midnight + hours_6`);
         start_time = end_time + 36000000;
      } else {
         // console.log(`Restart time - Option 2)
         //     drive_time_msec < hours_14 && end_time + hours_10 <= midnight + hours_6`);
         start_time = midnight + 21600000;
      }
   } // drive period > 14 hours & drive period < 18 hours
   else if (drive_time_msec >= 50400000 && drive_time_msec < 28800000) {
      if (end_time + (86400000 - drive_time) < midnight + 21600000) {
         // console.log(`Restart time - Option 3)
         //     drive_time_msec >= hours_14 && drive_time_msec < hours_18 && end_time + (hours_24 - drive_time) < midnight + hours_6`);
         start_time = end_time + (86400000 - drive_time_msec);
      } else {
         // console.log(`Restart time - Option 4)
         //     drive_time_msec >= hours_14 && drive_time_msec < hours_18  && end_time + (hours_24 - drive_time) > midnight + hours_6`);
         start_time = midnight + 21600000;
      }
   } else {
      // console.log(`Option 5)
      //     drive_time_msec > hours_18`);
      start_time = Math.min(midnight + (86400000 - drive_time_msec), end_time + (86400000 - drive_time_msec));
   }
   return start_time;
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
   let { start_time, break_period, drive_time_msec,
      timezone_user, legs_per_day } = req.payload.data.trip.overview;
   let midnight = calcMidnight(start_time, timezone_user);
   midnight = midnight + 86400000; // convert to next midnight
   next_data.timer = adjustTripStartTime(start_time, break_period, nodes[0].next_leg.duration.msec, midnight);
   //  increment midnight to next day if needed
   if (midnight < next_data.timer) {
      midnight += 86400000;
   }
   let day_start_time = next_data.timer;
   // vars for calculating start time for next day:
   let end_time, next_start_time, rest_stop_msec;
   // console.log('');
   // console.log('   ***  Check time_points');
   // console.log('   legs_per_day ', legs_per_day);
   // console.log('   meters_per_leg ', req.factory.meters_per_leg);
   // console.log('   meters_per_day ', req.factory.meters_per_day);
   // console.log('   total_meters ', req.factory.total_meters);
   // console.log('   way_points.length ', req.factory.way_points.length);
   // console.log('   all_points.length ', req.factory.all_points.length);
   for (let node_count = 0,
      current_meters = 0,
      day_start_meters = 0,
      leg_count = 0; node_count < nodes.length;) {
      next_data.status = "";
      // console.log('leg_count ', leg_count);
      if (node_count === 0) { // 1st node, create 1st time point
         next_data.status = "start_trip";
         // console.log(`         way_pt ${node_count}   all_pt ${req.factory.way_pts_prev_idxs[node_count]
         //    }   targets ${req.factory.targets[node_count]} ${Math.round(req.factory.meters_per_leg) * leg_count
         //    }   meters ${current_meters - day_start_meters}           - start trip`);
         // don't add to running totals
         pushTimePoint(req, next_data, node_count)
         leg_count++;
         node_count++;
      } else { // is not first node
         if (!(node_count === nodes.length - 1)) { // if not last node of trip
            // if all legs for day are not completed
            if (leg_count < legs_per_day &&
               // and if enough time for next interval before midnight
               next_data.timer + nodes[node_count - 1].next_leg.duration.msec + nodes[node_count].next_leg.duration.msec < midnight) {
               next_data.status = "enroute";
               // add just completed drive time and distance to running totals
               next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               // console.log(`         way_pt ${node_count}   all_pt ${req.factory.way_pts_prev_idxs[node_count]}   targets ${req.factory.targets[node_count]} ${Math.round(req.factory.meters_per_leg) * leg_count}   meters ${current_meters - day_start_meters}`);
               pushTimePoint(req, next_data, node_count)
               leg_count++;
               node_count++;
            }
            else { // rest stop - done driving for the day, not end of trip
               // rest stop, part 1 - create 1st time point at this location - "end_day"
               next_data.status = "end_day";
               // add just completed drive time and distance to running totals
               next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               next_data.miles_today = Math.round((current_meters - day_start_meters) / 1609.34)
                  + ' miles'
               next_data.hours_today = secondsToHoursStr((next_data.timer - day_start_time) / 1000);
               // console.log(`         way_pt ${node_count}   all_pt ${req.factory.way_pts_prev_idxs[node_count]}   targets ${req.factory.targets[node_count]} ${Math.round(req.factory.meters_per_leg) * leg_count}   meters ${current_meters - day_start_meters} - total meters for day`);
               // console.log('');
               pushTimePoint(req, next_data, node_count)
               // rest stop, part 2 - "start_day"
               // layover at same node so:
               // - create 2nd time point at this location
               // - don't increment nodes
               // - don't add distance to current_meters
               end_time = next_data.timer;
               next_start_time = setNextStartTime(end_time, drive_time_msec, midnight)
               // get number of milliseconds between end_time and next_start_time
               rest_stop_msec = next_start_time - end_time;
               next_data.status = "start_day";
               next_data.rest_hours = rest_stop_msec / 3600000;
               next_data.timer += rest_stop_msec;
               next_data.miles_today = null;
               next_data.hours_today = null;
               day_start_meters = current_meters;
               day_start_time = next_data.timer;
               pushTimePoint(req, next_data, node_count)
               // increment midnight to next day:
               midnight += 86400000;
               leg_count = 1; // begin first driving period of new day
               // console.log(`         way_pt ${node_count}   all_pt ${req.factory.way_pts_prev_idxs[node_count]}   targets ${req.factory.targets[node_count]} ${Math.round(req.factory.meters_per_leg) * leg_count}   meters ${current_meters - day_start_meters}       - begin day`);
               node_count++ // now leaving this node in the morning
            }
         } else {  // if last node of trip
            next_data.status = "end_trip";
            // add just completed drive time and distance to running totals
            next_data.timer += nodes[node_count - 1].next_leg.duration.msec;
            current_meters += nodes[node_count - 1].next_leg.distance.meters;
            next_data.miles_today = Math.round((current_meters - day_start_meters) * 0.000621371) + ' miles'
            next_data.hours_today = secondsToHoursStr((next_data.timer - day_start_time) / 1000);
            // console.log(`         way_pt ${node_count}   all_pt ${req.factory.way_pts_prev_idxs[node_count]}   targets ${req.factory.targets[node_count]} ${Math.round(req.factory.meters_per_leg) * leg_count}   meters ${current_meters - day_start_meters} - total meters last day`);
            // console.log('');
            pushTimePoint(req, next_data, node_count)
            req.payload.data.trip.overview.end_time = next_data.timer;
            req.payload.data.trip.overview.total_hrs_text = secondsToHoursStr((next_data.timer - start_time) / 1000);
            leg_count++;
            node_count++;
         }
      }
   }
   return req;
}

module.exports = {
   createTimePoints
}
