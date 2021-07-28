const { secondsToHoursStr } = require('./utilities');

function getCityString(address) {
   let components = address.split(",");
   let city = components[components.length - 3].trim();
   let statePlusZip = components[components.length - 2].trim();
   components = statePlusZip.split(' ');
   // option - add properties for zipCode and country
   let state = components[0]
   let result = city + " " + state;
   return result;
}

function createNodes(req, res, next) {
   let factory = req.factory;
   let legs = req.factory.legs;
   let cityState;
   let meters_per_second = req.factory.meters_per_second;
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
            "seconds": Math.round(duration_in_seconds),
            "msec": Math.round(duration_in_seconds * 1000),
            "text": secondsToHoursStr(duration_in_seconds)
         }
      }
      factory.nodes.push({
         "cityState": cityState,
         "latLng": legs[i].start_location,
         "time_points": [],
         "next_leg": next_leg
      });
      // add last way_point (waypoints.length = legs.length + 1)
      if (i === legs.length - 1) {
         factory.nodes.push({
            "cityState": getCityString(legs[i].end_address),
            "latLng": legs[i].end_location,
            "time_points": []
         })
      }
   })
   return req;
}

module.exports = {
   createNodes,
   secondsToHoursStr
}
