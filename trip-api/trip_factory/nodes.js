const { secondsToHoursStr } = require('./utilities');

function getCityString(address) {
   if (address) {
      let components = address.split(",");
      let city = components[components.length - 3].trim();
      let statePlusZip = components[components.length - 2].trim();
      components = statePlusZip.split(' ');
      // option - add properties for zipCode and country
      let state = components[0]
      let result = city + " " + state;
      return result;
   } else { return "Unknown place"; }

}

function createNodes(req, res, next) {
   let { factory, payload } = req;
   let legs = req.factory.legs;
   let cityState;
   let meters_per_second = req.factory.meters_per_second;
   let duration_in_seconds;
   let next_leg;
   legs.forEach((x, i, legs) => {
      cityState = getCityString(legs[i].start_address);
      if (i === 0) {
         // reset origin to remove misspellings in user input
         payload.data.trip.overview.origin = cityState;
      }
      // save city to payload for validating/debugging
      payload.data.trip.cities.push(cityState)

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

      // add last way_point (bc waypoints.length = legs.length + 1)
      if (i === legs.length - 1) {
         let destination = getCityString(legs[i].end_address)
         factory.nodes.push({
            "cityState": destination,
            "latLng": legs[i].end_location,
            "time_points": []
         })
         payload.data.trip.cities.push(destination)
         // reset end_point to remove misspellings in user input
         payload.data.trip.overview.end_point = destination;
      }
   })
   return req;
}

module.exports = {
   createNodes,
   secondsToHoursStr
}
