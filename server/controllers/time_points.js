function getLocalTimeZone() {
   let currentTimeSec = Math.floor(Date.now() / 1000);
   let api_key = 'AIzaSyCYpGBquj5EySnkz_0NgyrBl6iVmYoTb9U';

}

function setTimePointData(time_stamp, way_point_data) {
   let { lat, lng } = way_point_data.latLng;
   let time_temp = new Date(Math.round(time_stamp))
   let month = time_temp.getMonth();
   let date = time_temp.getDate();
   let hour = time_temp.getHours();
   let minutes = time_temp.getMinutes().toString();
   if (minutes.length === 1) { 
      minutes = '0' + minutes;
   }
   let time_text = `${month}/${date} ${hour}:${minutes}`;

   let time_point = {
      "time_stamp": Math.round(time_stamp),
      "time_text": time_text,
      "latLng": {
         "lat": lat,
         "lng": lng
      },
      "place_name": way_point_data.place_name,
      "type": "origin",
      "local_time_zone": "",
      "weather": { }
   }
   return time_point
}
function setNextStartTime(end_time, drive_time_msec, midnight) {
   console.log('calculate restart time after break period - ');
   let start_time;
   if (drive_time_msec < 50400000) {
      if (end_time + 36000000 > midnight + 21600000) {
         console.log('1)   drive_time_msec < hours_14 && end_time + hours_10 > midnight + hours_6');
         let var1 = (end_time + 36000000);
         console.log('end_time + hours_10 :>> ', var1);
         let var2 = (midnight + 21600000);
         console.log('midnight + hours_6 :>> ', var2);
         start_time = end_time + 36000000;
      } else { 
         console.log('2)   drive_time_msec < hours_14 && end_time + hours_10 <= midnight + hours_6');
         start_time = midnight + 21600000;
      }
   } else if (drive_time_msec >= 50400000 && drive_time_msec < 28800000) {
      if (end_time + (86400000 - drive_time) < midnight + 21600000) {
         console.log('3)   drive_time_msec >= hours_14 && drive_time_msec < hours_18 && end_time + (hours_24 - drive_time) < midnight + hours_6');
         start_time = end_time + (86400000 - drive_time_msec);
      } else {
         console.log('4)   drive_time_msec >= hours_14 && drive_time_msec < hours_18  && end_time + (hours_24 - drive_time) > midnight + hours_6');
         start_time = midnight + 21600000;
      }
   } else {
      console.log('5)   drive_time_msec > hours_18');
      start_time = midnight + (86400000 - drive_time_msec);
   }
   return start_time;
}
function createTimePoints(req, res, next) {  
   let legs = req.payload.data.trip.legs;
   let way_points = req.payload.data.trip.way_points;
   let params = req.payload.data.trip.params;
   let time_points = req.payload.data.trip.time_points;

   let intervals_per_day = req.trip.num_intervals;
   let break_period = params.break_period;
   // let hours_6 = 21600000;
   // let hours_10 = 36000000;
   // let hours_14 = 50400000;
   // let hours_18 = 28800000;
   // let hours_24 = 86400000;
   let drive_time_msec = parseFloat(params.hours_driving) * 3600000;
   // convert start time to milliseconds
   let depart_time_0 = new Date(params.start_time);
   let depart_time = depart_time_0.getTime();
   params.start_time = depart_time;
   // create first day midnight in milliseconds
   let midnight_0 = new Date(depart_time);
   midnight_0.setHours(0);
   midnight_0.setMinutes(0);
   midnight_0.setSeconds(0);
   midnight_0.setMilliseconds(0);
   let midnight = midnight_0.getTime();
   // convert to next midnight
   midnight += 86400000;
   // end_time is used to calculate start time for next day
   let end_time;
   let next_start_time;
   // timer keeps running total, accumulating each drive time or break period 
   let timer; 

   //============== create time_points ==============
   // 1st way_point is origin so drive time is not relevant
   // except to check for the corner case.
   if (depart_time + legs[0].duration.msec < midnight) {
      timer = depart_time;
   } else {    
      // corner case - start time is too close to midnight,
      // delay start time until next morning 
      if (break_period < 21600000) {
         timer = midnight + break_period; }
      else { 
         timer = midnight + 21600000; }
      midnight += 86400000;
   }
   let way_pt_counter = 0;
   time_points.push(setTimePointData(timer, way_points[way_pt_counter]));
   way_pt_counter++;
   // 1st leg driving time effects 2nd way point, 
   // so leg[x] effects way_point[x + 1]
   let interval_counter = 0;

   for(let i = 0; i < legs.length - 1; ) {
      if (interval_counter <= intervals_per_day - 1) {
         timer += legs[i].duration.msec;
         i++;
         way_pt_counter++;
         interval_counter++;
      }
      else {
         end_time = timer;
         next_start_time = setNextStartTime(end_time, drive_time_msec, midnight)
         console.log('next_start_time :>> ', next_start_time);
         // get number of milliseconds between end_time and next_start_time
         let stop_over_msec = next_start_time - end_time;
         timer += stop_over_msec;
         interval_counter = 0;
         // increment midnight to next day:
         midnight += 86400000;
      }     
      time_points.push(setTimePointData(timer, way_points[way_pt_counter]));
   }
   //      - set type of each time_point - 
   //           origin, arrival, departure, enroute, or end_point
   return req;
}

module.exports = {
   createTimePoints
 }
