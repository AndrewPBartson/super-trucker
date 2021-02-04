function secondsToTimeString(seconds) {
   let num_hours = Math.floor(seconds / 60 / 60);
   let hours_text = num_hours === 1 ? ' hour ' : ' hours ';
   let num_minutes = Math.round((seconds / 60) % 60);
   let minutes_text = num_minutes === 1 ? ' min' : ' mins';
   return num_hours + hours_text + num_minutes + minutes_text;
}
function getCityString(address) {
   let components = address.split(",");
   let city = components[components.length - 3].trim();
   let statePlusZip = components[components.length - 2].trim();
   components = statePlusZip.split(' ');
   // consider adding properties for zipCode and country
   let state = components[0]
   let result = city + " " + state;
   return result;
}
function addNodeGeoData(req) {
   let payload = req.payload.data.trip;
   let legs = req.trip.response.routes[0].legs;
   let cityState;
   let meters_per_second = req.trip.meters_per_second;
   let duration_in_seconds;
   let next_leg;
   legs.forEach((x, i, legs) => {
      cityState = getCityString(legs[i].start_address);
      duration_in_seconds = legs[i].distance.value / meters_per_second;
      next_leg = {
         "distance": {
            "meters": legs[i].distance.value,
            "text_mi": legs[i].distance.text
         },
         "duration": {
            // add duration as estimated by google api
            "seconds_est": legs[i].duration.value,
            "text_est": legs[i].duration.text,
            // add duration as calculated from user input
            "seconds": Math.round(duration_in_seconds),
            "msec": Math.round(duration_in_seconds * 1000),
            // add duration as string
            "text": secondsToTimeString(duration_in_seconds)
         }
      }
      payload.nodes.push({ "cityState": cityState });
      payload.nodes[i].address = legs[i].start_address;
      payload.nodes[i].latLng = legs[i].start_location;
      payload.nodes[i].time_points = [];
      payload.nodes[i].next_leg = next_leg;
      payload.nodes[i].timezone_id_local = payload.weather[i].timezone_id_local

      // add final way_point (waypoints.length = legs.length + 1)
      if (i === legs.length - 1) {
         cityState = getCityString(legs[i].end_address);
         payload.nodes.push({ "cityState": cityState });
         payload.nodes[i + 1].address = legs[i].end_address;
         payload.nodes[i + 1].latLng = legs[i].end_location;
         payload.nodes[i + 1].time_points = [];
         payload.nodes[i + 1].timezone_id_local = payload.weather[i + 1].timezone_id_local

      }
   })
}
function createPayloadStructure(req) {
   // convert date object to milliseconds
   let start_tmp;
   req.body.depart_time ? start_tmp = new Date(req.body.depart_time) : start_tmp = newDate();
   let start_time_msec = start_tmp.getTime();
   req.payload = {
      "data": {
         "trip": {
            "params": {
               "origin": req.body.origin,
               "end_point": req.body.end_point,
               "start_time": start_time_msec,
               "drive_time_hours": req.body.hours_driving,
               "drive_time_msec": parseFloat(req.body.hours_driving) * 3600000,
               "avg_speed": req.body.avg_speed,
               "miles_per_day": req.body.miles_per_day,
               "break_period": req.trip.break_period,
               "timezone_user": req.body.timezone_user,
               "timezone_id_user": req.trip.timezone_id_user,
               "total_meters": req.trip.total_meters,
               "total_mi": Math.round(req.trip.total_meters / 1609.34),
               "total_mi_text": req.trip.total_mi_text,
               "summary": req.trip.response.routes[0].summary,
               "bounds": req.trip.response.routes[0].bounds,
               "intervals_per_day": req.trip.intervals_per_day
            },
            "nodes": [],
            "day_nodes": [],
            "time_points": [],
            "weather": req.trip.weather
            // optional - for diagnostics during development
            // "route": req.trip.response.routes[0] // raw data from google
         }
      }
   };
}
function createTripPath(req, res, next) {
   createPayloadStructure(req);
   // add place name and leg data to payload.nodes
   addNodeGeoData(req);
   return req;
}

module.exports = {
   createTripPath,
   secondsToTimeString
}
