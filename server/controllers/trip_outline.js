function formatAddress(address) {
   let components = address.split(",");
   let city = components[components.length-3].trim();
   let statePlusZip = components[components.length-2].trim();
   components = statePlusZip.split(' ');
   let state = components[0]
   let result = city + " " + state;
   return result;
}

function addPointData(trip, payload) {
   let address, cityState;
   trip.routes[0].legs.forEach((leg, i, arr) => {
      address = arr[i].start_address;
      cityState = formatAddress(address);
      payload.data.trip.way_points.push({ "text": cityState });
      payload.data.trip.way_points[i].latLng = arr[i].start_location;
      if (i === trip.routes[0].legs.length - 1) {
         address = arr[i].end_address;
         cityState = formatAddress(address);
         payload.data.trip.way_points.push({ "text": cityState });
         payload.data.trip.way_points[i+1].latLng = arr[i].end_location;
      }
   })
   return payload;
}

function addDistances(trip, payload) {
   let text, value;
   trip.routes[0].legs.forEach((leg, i, arr) => {
      text = arr[i].distance.text;
      value = arr[i].distance.value;
      payload.data.trip.legs.push({ "text": text }) 
      payload.data.trip.legs[i].value = arr[i].distance.value;
   })
   return payload;
}

function createTripOutline(req, res, next) {
   let payload = { };
   payload = {
     "data": {
        "trip": {
           "params": {
              "avg_speed": req.body.avg_speed,
              "miles_per_day": req.body.miles_per_day,
              "hours_driving": req.body.hours_driving,
              "origin": req.body.origin,
              "end_point": req.body.end_point,
              "start_time": req.body.depart_time,
              "daily_end_time": "Midnight",
              "time_zone_user": "PST"
           },
           // "raw_legs": req.trip.response.routes[0].legs,
           "way_points": [ ],
           "legs": [ ]
         }
       }
   }
   addPointData(req.trip.response, payload) ;
   addDistances(req.trip.response, payload); 
   return payload;
}

module.exports = {
   createTripOutline
 }

//  "way_points": [
//    {
//       "place_name": {
//          "city": "Wagon Mound",
//          "state": "New Mexico",
//          "city_state": "Wagon Mound NM"
//       },
//       "coordinates": {
//          "lat": 123,
//          "lng": 345
//       },
//       "times": [
//          {
//             "type": "arrival",
//             "date_time": {
//                "time_zone_local": "MST",
//                "time_local": 123456789,
//                "time_GMT": 987654323
//             },
//             "weather": {
//                "basic": "Mostly Sunny",
//                "details": "Mostly sunny, with a high near 59.      Northwest wind around 5 mph.",
//                "temperature": {
//                   "type": "high",
//                   "value": 59
//                },
//                "icon": "weather_icons/mostly_sunny.png"
//             }
//          },
//          {
//             "type": "departure",
//             "date_time": {
//                "time_zone_local": "MST",
//                "time_local": 934511166789,
//                "time_GMT": 12567654323
//             },
//             "weather": {
//                "basic": "Partly Cloudy",
//                "details": "Partly cloudy, with a low around 48. Northwest wind around 5 mph.",
//                "temperature": {
//                   "type": "low",
//                   "value": 48
//                },
//                "icon": "weather_icons/partly_cloudy.png"
//             }
//          }
//       ]
//    },
//    {
//       "place_name": {
//          "city": "Lake Charles",
//          "state": "Louisiana",
//          "city_state": "Lake Charles LA"
//       },
//       "coordinates": {
//          "lat": 567,
//          "lng": 789
//       },
//       "times": [
//          {
//             "type": "enroute",
//             "date_time": {
//                "time_zone_local": "MST",
//                "time_local": 123456789,
//                "time_GMT": 987654323
//             }
//          }
//       ],
//       "weather": {
//          "basic": "Rain",
//          "details": "Rain, mainly after 10am. High near 55. Chance of precipitation is 80%.",
//          "temperature": {
//             "type": "high",
//             "value": 55
//          },
//          "icon": "weather_icons/rain_80pct.png"
//       }
//    }
// ],
// "legs": [
//    {
//       "duration": {
//          "text": "7 hours 56 mins",
//          "value": 28565
//       },
//       "distance": {
//          "text": "534 mi",
//          "value": 859636
//       }
//    },
//    {
//       "duration": {
//          "text": "3 hours 58 mins",
//          "value": 14225
//       },
//       "distance": {
//          "text": "267 mi",
//          "value": 42900
//       }
//    }
// ]