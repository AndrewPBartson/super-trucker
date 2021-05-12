const { secondsToTimeString } = require('./utilities');

function setTimePointData(timeStamp, label, node_data) {
   return {
      "timestamp": timeStamp,
      "city_state": node_data.cityState, // extra - reality check - ok to delete for production
      "status": label,
      "weather": {}
   }
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
/* 
let hours_6 = 21600000
let hours_10 = 36000000
let hours_12 = 43200000
let hours_14 = 50400000
let hours_18 = 28800000
let hours_24 = 86400000
*/
function createTimePoints(req, res, next) {
   // at outset, time_points and day_nodes are empty [ ]. How does day_nodes work?
   let { nodes, time_points, day_nodes } = req.payload.data.trip;
   let { start_time, break_period, drive_time_msec, timezone_user, intervals_per_day } = req.payload.data.trip.overview;
   let midnight = calcNextMidnight(start_time, timezone_user);
   // keep running totals during loop
   let day_count = 0;
   let current_meters = 0; // accumulate distance traveled in meters
   let day_start_meters = 0;
   let timer; // accumulator for each drive time and/or break period 
   // set time to start trip on day 1 -
   if (start_time + nodes[0].next_leg.duration.msec < midnight) {
      timer = start_time;
   } else { // edge case - start time is too close to midnight,
      // delay start time until midnight plus break_period
      if (break_period < 21600000) { timer = midnight + break_period; }
      // delay start time until next morning at 6:00 am
      else { timer = midnight + 21600000; }
      // increment midnight to next day:
      midnight += 86400000;
   }
   let day_start_time = timer;
   // vars for calculating start time for next day
   let end_time, next_start_time, rest_stop_msec;
   let status; // start_trip, start_day, enroute, end_day, end_trip
   let interval_count = 0;

   for (let node_count = 0; node_count < nodes.length;) {
      status = "";
      // first time_point
      if (node_count === 0) {
         // don't add to running totals (timer & meters)
         status = "start_trip";
         // explain me what day_nodes is for?
         day_nodes.push([node_count]);
         // save time_points twice  1) to req.payload.data.trip.nodes.time_points  
         // 2) to req.payload.data.trip.time_points
         time_points.push(setTimePointData(timer, status, nodes[node_count]));
         nodes[node_count].time_points.push(setTimePointData(timer, status, nodes[node_count]));
         nodes[node_count].type = status;
         nodes[node_count].meter_count = current_meters;
         nodes[node_count].day_start_meters = day_start_meters;
         nodes[node_count].day_start_time = day_start_time;
         node_count++;
      } else { // not first node
         // for nodes that are not first node, add just completed drive time to timer
         if (!(node_count === nodes.length - 1)) { // if not last node of trip
            // if not done driving for the day, and enough time for next interval before midnight -
            if (interval_count < intervals_per_day &&
               timer + nodes[node_count - 1].next_leg.duration.msec + nodes[node_count].next_leg.duration.msec < midnight) {
               status = "enroute";
               timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               interval_count++;
               day_nodes[day_count].push(node_count);
               time_points.push(setTimePointData(timer, status, nodes[node_count]));
               nodes[node_count].time_points.push(setTimePointData(timer, status, nodes[node_count]));
               nodes[node_count].type = status;
               nodes[node_count].meter_count = current_meters;
               nodes[node_count].day_start_meters = day_start_meters;
               nodes[node_count].day_start_time = day_start_time;
               node_count++;
            }
            else { // done driving for the day, not end of trip, aka 'rest_stop'
               // rest stop, part 1 - create first time point at this location - ""end_day"
               status = "end_day";
               timer += nodes[node_count - 1].next_leg.duration.msec;
               current_meters += nodes[node_count - 1].next_leg.distance.meters;
               interval_count++;
               time_points.push(setTimePointData(timer, status, nodes[node_count]));
               nodes[node_count].time_points.push(setTimePointData(timer, status, nodes[node_count]));
               nodes[node_count].type = "rest_stop";
               nodes[node_count].meter_count = current_meters;
               nodes[node_count].day_start_meters = day_start_meters;
               nodes[node_count].day_start_time = day_start_time;
               nodes[node_count].miles_today = Math.round((current_meters - day_start_meters) * 0.000621371)
                  + ' miles'
               nodes[node_count].hours_today = secondsToTimeString((timer - day_start_time) / 1000);
               // rest stop, part 2 - create second time point at this location - "start_day"
               // don't increment nodes - layover at same node
               end_time = timer;
               next_start_time = setNextStartTime(end_time, drive_time_msec, midnight)
               // get number of milliseconds between end_time and next_start_time
               rest_stop_msec = next_start_time - end_time;
               // increment midnight to next day:
               midnight += 86400000;
               status = "start_day";
               timer += rest_stop_msec;
               interval_count = 0; // begin first driving period of new day
               day_count++;
               day_start_meters = current_meters;
               day_start_time = timer;
               day_nodes.push([node_count]);
               time_points.push(setTimePointData(timer, status, nodes[node_count]));
               nodes[node_count].time_points.push(setTimePointData(timer, status, nodes[node_count]));
               node_count++ // now leaving this way_point in the morning
            }

         } else {  // if last way_point of trip
            status = "end_trip";
            timer += nodes[node_count - 1].next_leg.duration.msec;
            current_meters += nodes[node_count - 1].next_leg.distance.meters;
            interval_count++;
            day_nodes.push([node_count]);
            time_points.push(setTimePointData(timer, status, nodes[node_count]));
            nodes[node_count].time_points.push(setTimePointData(timer, status, nodes[node_count]));
            nodes[node_count].type = status;
            nodes[node_count].meter_count = current_meters;
            nodes[node_count].day_start_meters = day_start_meters;
            nodes[node_count].day_start_time = day_start_time;
            nodes[node_count].miles_today = Math.round((current_meters - day_start_meters) * 0.000621371) + ' miles'
            nodes[node_count].hours_today = secondsToTimeString((timer - day_start_time) / 1000);
            node_count++;

         }
      }
   }
   return req;
}

module.exports = {
   createTimePoints
}
