let model = require('../models');
let options = require('../models/options')
const axios = require('axios')
const polyline = require('polyline')

function isValidTripInput(trip) {
  // must have origin and destination or for gedda boudit
  return true; 
}

function getAllTripsController(req, res, next) {
  model.trips.getAllTrips()
    .then((result) => {
      res.status(200).json(result);
    })
};

function getTripByIdController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({message: 'Invalid ID, not a number'});
  }
  else {
    model.trips.getTripById(req.params.id)
      .then((result) => {
        if(result) {
          res.status(200).json(result);
        }
        else {
          res.status(404);
          next({message: 'ID not found'});
        }
      })
    }
}

function printCurrentResults(trip) { 
  console.log('trip_points.length - ', trip.trip_points.length)  
  //console.log('total mi - ', trip.total_mi)
  console.log('total_meters - ', trip.total_meters)
  //console.log('user_mi_per_day - ', trip.user_mi_per_day)
  console.log('user_meters_per_day - ', trip.user_meters_per_day)
  console.log('num_segments - ', trip.num_segments)
  console.log('num_legs - ', trip.num_legs)
  console.log('round_num_legs - ', trip.round_num_legs)
  console.log('segments_per_leg - ', trip.segments_per_leg)
  console.log('segments_per_leg_no_round - ', trip.segments_per_leg_no_round)
  console.log('leftovers - ', trip.leftovers)
  return 
}

function processUserInput(req_data) {
  let trip = {};
  trip.depart_time = req_data.depart_time
  trip.use_defaults = req_data.use_defaults
  trip.cycle_24_hr = req_data.cycle_24_hr
  trip.speed = req_data.speed
  trip.hours_driving = req_data.hours_driving
  trip.resume_time = req_data.resume_time
  trip.hours_rest = req_data.hours_rest
  trip.user_mi_per_day = 500;
  trip.user_meters_per_day = trip.user_mi_per_day * 1609.34
  // trip.user_mi_per_day = req_data.speed * req_data.hours_driving
  trip.origin = req_data.origin
  trip.end_point = req_data.end_point
  //console.log('user input - lets go - ', trip)
  return trip;
}

function getMeterCounts(trip) {
   // Create an array of estimated meter accumulation at each trip_point
  let { segments_per_leg, round_num_legs, leg_distances, leftovers, 
    segments_per_leg_no_round } = trip;
  trip.meter_counts = [0]; 
  let running_total = 0;
  let current_step;     
  let temp_num_segments = segments_per_leg;

  for( let i = 0; i < round_num_legs + 1; i++) {
    // if last leg, get correct number of 'leftover' segments
    if ( i === round_num_legs) {
      current_step = leg_distances[i]/leftovers
      temp_num_segments = leftovers;
    }
    else {
      current_step = leg_distances[i]/segments_per_leg_no_round;
    }
    for( let j = 0; j < temp_num_segments; j++) {
      running_total += current_step
      trip.meter_counts.push(Math.round(running_total));
    }
  }
  return trip.meter_counts
}

function setUrlWithWayPoints(way_points) {
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=`
  trip_url +=  way_points[0] + "&destination=" + way_points[way_points.length -1] + "&waypoints=";
  for (let i = 1; i < way_points.length-1; i++) {
    trip_url += way_points[i];
    if (i !== way_points.length-2) {
      trip_url += '|';
    }
  }
  trip_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return trip_url
}

function findMeterCountAtBreakPoints(trip) {
  let { meter_counts, trip_points, user_meters_per_day } = trip

  let new_way_point;
  let new_way_points = [];
  trip.way_points_set = [];
  way_points_set = trip.way_points_set;
  let break_point = user_meters_per_day
  let target_break_point = 0
  let way_pt_obj = {}
  let cutoff, diff

  // Iterate through meter_counts to find value closest to each
  // stopping point - 'next_break_point'. Create an object with
  // relevant info for each stopping point and push to 
  // way_points_set.
  for ( let b = 0; b < meter_counts.length; b++ ) {
    way_pt_obj = {}
    // for each meter_count, check if greater than next_break_point
    if (meter_counts[b] > target_break_point) {
    // if yes, select the meter_count that is closest to break_point
    // create cutoff point midway between: [b] or [b+1] or [b-1]
    
    // if first element
    if (b == 0) {
      new_way_point = trip_points[b]
      way_pt_obj.prev = null
      way_pt_obj.stop = trip_points[b]
      if (isNaN(meter_counts[b+1])) {
        way_pt_obj.next = null
      }
      else {
        way_pt_obj.next = trip_points[b+1]
      }
    }
    // if last element
    else if (b === meter_counts.length-1) {
      new_way_point = trip_points[b]
      way_pt_obj.next = null;
      way_pt_obj.stop = trip_points[b]
      if (isNaN(meter_counts[b-1])) {
        way_pt_obj.prev = null
      }
      else {
        way_pt_obj.prev = trip_points[b-1]
      }
    } 
    else {  // not first, not last
      diff = meter_counts[b] - meter_counts[b-1]
      cutoff = meter_counts[b-1] + (diff/2) 
      if (meter_counts[b] > cutoff) {
        new_way_point = trip_points[b]
        way_pt_obj.stop = trip_points[b]
        way_pt_obj.prev = trip_points[b-1]
        way_pt_obj.next = trip_points[b+1]
      }
      else {
        new_way_point = trip_points[b-1]
        way_pt_obj.stop = trip_points[b-1]
        if (isNaN(merge_counts[b-2])) {
          way_pt_obj.prev = null 
        }
        else {
          way_pt_obj.prev = trip_points[b-2]
        }
        way_pt_obj.next = trip_points[b]
      }
    }
    new_way_points.push(new_way_point) 
    way_points_set.push(way_pt_obj)
      console.log('target_break_point - ', target_break_point)
      target_break_point += break_point
    }
  }
  return new_way_points
}

function getTripPoints(trip) {
  trip.trip_points = []
  return trip
}

function getFirstWayPoints(trip) {
  getTripPoints(trip) 
  trip.way_points = []
  let format_origin = trip.origin.split(" ").join("+") 
  let format_end_point = trip.end_point.split(" ").join("+")
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${format_origin}&destination=${format_end_point}
    &key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
    //console.log('url - ', trip_url) 
  
  return axios.get(trip_url)
  .then(response => {
    // get the polyline points and decode them into an array
    trip.trip_points = polyline.decode(response.data.routes[0].overview_polyline.points)
    // find out how many points there are
    trip.num_segments = trip.trip_points.length - 1
    // get total length of trip in meters and miles
    trip.total_meters = response.data.routes[0].legs[0].distance.value
    trip.total_mi = trip.total_meters / 1609.34
    // calculate the number of driving periods (legs) to destination
    trip.num_legs = trip.total_mi/trip.user_mi_per_day
    // determine number of segments that should be in each leg
    // some inaccuracy is added here because the number of segments per leg/day must
    // be an integer. In other words, the end of leg can't fall between 
    // the trip_points, rather it is assigned to the closest previous trip point.
    trip.segments_per_leg_no_round = trip.num_segments/trip.num_legs
    trip.segments_per_leg = Math.floor( trip.num_segments/trip.num_legs )
    // convert num_legs to int for iteration purposes
    trip.round_num_legs = Math.floor(trip.num_legs)
    // calculate number of 'leftover' segments in final driving period
    trip.leftovers = trip.num_segments - (trip.round_num_legs * trip.segments_per_leg)
    let count = 0;
    // gather way_points -
    // grab out a point that (somewhat) corresponds to end of each leg
    for (let i = 0; i <= trip.round_num_legs; i++) {
      trip.way_points.push(trip.trip_points[count]);
      count += trip.segments_per_leg
    }
    trip.way_points.push(trip.trip_points[trip.trip_points.length-1]) // push destination
    return trip
  })
  .catch(function(error) {
    console.log(error);
  });
}

function recalculateWayPoints(trip) {
  let { total_mi, total_meters, user_mi_per_day, user_meters_per_day, 
    num_segments, num_legs, round_num_legs, segments_per_leg, 
    segments_per_leg_no_round, leftovers, way_points, trip_points, 
    way_points_revised, meter_counts } = trip;
  let leg_distances = [];
  trip.leg_distances = leg_distances;
  console.log('way_points before axios - ', way_points)

  let trip_url = setUrlWithWayPoints(way_points)
  return axios.get(trip_url)
    .then(response => {
      // get leg distances (distance covered in one driving period)
      let legos = response.data.routes[0].legs
      for(  let i = 0; i < legos.length; i++) {
        leg_distances.push(legos[i].distance.value)
      }
      console.log('leg_distances.length - ', leg_distances.length)

      let meter_counts = getMeterCounts(trip)
    
      // Calculate and apply correction factor
      let correction_factor = (total_meters - meter_counts[meter_counts.length-1])/total_meters
      for( let k = 0; k < meter_counts.length; k++) {
        meter_counts[k] = Math.floor(meter_counts[k]*(correction_factor+1))
      }
      let meter_ct_error = total_meters - meter_counts[meter_counts.length-1]
      console.log('correction_factor - ', correction_factor) 
      console.log('meter_counts error (in m) - ', meter_ct_error)

      let new_way_points = findMeterCountAtBreakPoints(trip)

      trip.way_points = new_way_points;
      printCurrentResults(trip)
      console.log('new_way_points - ', new_way_points)
      return new_way_points
    })
    .catch(function(error) {
      console.log(error);
    });
}

function createTripController(req, res, next) {
    if(!isValidTripInput(req.body)) {
      next({message: 'Invalid or missing input'});
    }
    else {
      let trip = processUserInput(req.body)
      let promise_1 = getFirstWayPoints(trip)
      promise_1
        .then(trip => {
          let promise_2 = recalculateWayPoints(trip)      
          promise_2
         return trip
        })
        .then(trip2 => {
          let promise_3 = recalculateWayPoints(trip2)      
          promise_3
            .then(response_2 => {
              res.json(response_2)
          })
          .catch(function(error) {
            //console.log('Channthy Kak - the soaring voice of Khmer Rock')
            console.log(error);
          });
      })

      // After reasonable way_points are selected, search for 
      // Search for places near each way_point (motel, gas, whatever)
      // display route with stops for user
      // save trip to db
      //   model.trips.createTrip(req.body)
      //   .then(trips => {
      //   res.status(201).json(trips[0]);
      // })
    
        //res.json(trip_points)
      }
        // .catch(function(error) {
        //   // console.log('Channthy Kak - the soaring voice of Khmer Rock')
        //   console.log(error);
        // });
    }

function updateTripController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({message: 'Invalid ID, not a number'});
  }
  else if (!isValidTripInput(req.body)) {
    return next({message: 'Invalid or missing input'});
  }
  else {
    model.trips.updateTrip(req.params.id, req.body)
      .then(trips => {
        res.status(200).json(trips[0])
      })
  }
}

function deleteTripController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({message: 'Invalid ID, not a number'});
  }
  else {
    model.trips.deleteTrip(req.params.id)
    .then((result) => {
      if(result) {
        res.status(200).json({ result });
      }
      else {
        res.status(404);
        next({message: 'ID not found'});
      }
    })
  }
}

module.exports = {
  getAllTripsController,
  getTripByIdController,
  createTripController,
  updateTripController,
  deleteTripController
}

// [48.62971, -122.35836]
// [44.60247, -117.47512]
// [41.20955, -111.09768]
// [41.11377, -101.73786]
// [38.94703, -92.99966]
// [35.86858, -86.45881]
// [29.48547, -82.28843]