function formatAddress(address) {
   let components = address.split(",");
   let city = components[components.length-3].trim();
   let statePlusZip = components[components.length-2].trim();
   components = statePlusZip.split(' ');
   let state = components[0]
   let result = city + " " + state;
   return result;
}
function addLocationData(req) {
   let address, cityState;
   let payload = req.payload.data.trip;
   let legs = req.trip.response.routes[0].legs;
   legs.forEach((x, i, legs) => {
      cityState = formatAddress(legs[i].start_address);
      payload.way_points.push({ "place_name": cityState });
      payload.way_points[i].latLng = legs[i].start_location;
      payload.way_points[i].time_points = [ ];
      if (i === legs.length - 1) {
         cityState = formatAddress(legs[i].end_address);
         payload.way_points.push({ "place_name": cityState });
         payload.way_points[i+1].latLng = legs[i].end_location;
         payload.way_points[i+1].time_points = [ ];
      }
   })
}
function addDistances(req) {
   let legs_0 = req.trip.response.routes[0].legs;
   let payload = req.payload.data.trip;
   let meters_per_second = req.trip.meters_per_second;
   let duration_in_seconds;
   let duration_in_minutes;
   let duration_text = '';
   
   legs_0.forEach((leg, i, legs_0) => {
      payload.legs.push({ 
         "distance": { },
         "duration": { }
      })
      payload.legs[i].distance.meters = legs_0[i].distance.value;
      payload.legs[i].distance.text_mi = legs_0[i].distance.text;

      duration_in_seconds = legs_0[i].distance.value / meters_per_second
      duration_in_minutes = duration_in_seconds / 60;
      duration_text = Math.floor(duration_in_minutes / 60) + ' hours ' 
        + Math.round(duration_in_minutes % 60) + ' mins'

      payload.legs[i].duration.text = duration_text; 
      payload.legs[i].duration.value_est = legs_0[i].duration.value;
      payload.legs[i].duration.text_est = legs_0[i].duration.text;
      payload.legs[i].duration.seconds = duration_in_seconds;
      payload.legs[i].duration.msec = duration_in_seconds * 1000;     
   })
}
function createPayloadStructure(req) {
   let break_period = (24 - req.body.hours_driving) * 3600000;
   if (break_period > 36000000) {
      break_period = 36000000;
   }
   req.payload = {
      "data": {
         "trip": {
            "params": {
               "avg_speed": req.body.avg_speed,
               "break_period": break_period,
               "end_point": req.body.end_point,
               "hours_driving": req.body.hours_driving,
               "miles_per_day": req.body.miles_per_day,
               "origin": req.body.origin,
               "start_time": req.body.depart_time,
               "time_zone_local": "",
               "time_zone_user": "PST",
               "total_meters": req.trip.total_meters,
               "total_mi": req.trip.total_meters / 1609.34
            },
            "legs": [ ],
            "way_points": [ ],
            "time_points": [ ],
            "weather_sets": [ ],
            // add raw data for development, delete later:
            "route": req.trip.response.routes[0]
          }
        }
    };
}
function createTripPath(req, res, next) {
   createPayloadStructure(req);
   // add place names and legs distances to payload
   addLocationData(req);
   addDistances(req);
   return req;
}

module.exports = {
   createTripPath
 }
