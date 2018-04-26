let model = require('../models');
const  = require('axios')
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
}

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

function processUserInput(req_data) {
  let trip = {};
  trip.exports = {}
  trip.depart_time = req_data.depart_time
  trip.use_defaults = req_data.use_defaults
  trip.cycle_24_hr = req_data.cycle_24_hr
  trip.speed = req_data.speed
  trip.hours_driving = req_data.hours_driving
  trip.resume_time = req_data.resume_time
  trip.hours_rest = req_data.hours_rest
  // trip.user_mi_per_day = trip.speed * trip.hours_driving
  trip.user_mi_per_day = 500;
  trip.miles_per_day = req_data.miles_per_day 
  trip.user_meters_per_day = trip.miles_per_day * 1609.34
  trip.origin = req_data.origin
  trip.end_point = req_data.end_point
  trip.leg_distances = []
  trip.meter_counts = []
  return trip;
}

function firstSimpleRequest(trip) { 
  trip.way_points = []
  let format_origin = trip.origin.split(" ").join("+") 
  let format_end_point = trip.end_point.split(" ").join("+")
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${format_origin}&destination=${format_end_point}
    &key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return axios.get(trip_url)
  .then(response => {
    return response
  })
  .catch(function(error) {
    console.log(error);
  });
}

function extractTripPoints(response, trip) {
  // takes the trip summary polyline and decodes it.
  // the result is an array of lat/lng coordinates - amazing
  trip.trip_points = polyline.decode(response.data.routes[0].overview_polyline.points)
  // get total length of trip in meters and miles
  trip.exports.trip_points = trip.trip_points
  trip.total_meters = response.data.routes[0].legs[0].distance.value
  trip.total_mi = trip.total_meters / 1609.34
  return trip
} 

function calcFirstWayPoints(trip) {
  // find out how many points and segments -
  trip.num_segments = trip.trip_points.length - 1
  // calculate number of driving periods (legs) to destination
  trip.num_legs = trip.total_mi/trip.miles_per_day
  // determine number of segments that should be in each leg
  trip.segments_per_leg = trip.num_segments/trip.num_legs
  trip.segments_per_leg_round = Math.floor( trip.num_segments/trip.num_legs )
  // convert num_legs to int for iteration purposes
  trip.num_legs_round = Math.ceil(trip.num_legs)
  // calculate number of 'leftover' segments in final driving period
  trip.leftovers = trip.num_segments - ((trip.num_legs_round -1) * trip.segments_per_leg_round)
  trip.num_segments_in_leg_array = [];
  for (let t = 0; t < trip.num_legs_round; t++) {
    if (t === trip.num_legs_round -1) {
      trip.num_segments_in_leg_array.push(trip.leftovers)
    }
    else {
      trip.num_segments_in_leg_array.push(trip.segments_per_leg_round)
    }
  }
  let count = 0;
  // gather way_points:
  // grab out a point that (somewhat) corresponds to end of each leg
  for (let i = 0; i <= trip.num_legs_round-1; i++) {
    trip.way_points.push(trip.trip_points[count]);
    count += trip.num_segments_in_leg_array[i]
  }
  trip.way_points.push(trip.trip_points[trip.trip_points.length-1]) // push destination
  console.log(' ')
  console.log('   First calcuation (guess) of way_points -')
  console.log(trip.way_points)
  return trip
}

function printRecalcResults(trip) { 
  console.log(' ')
  console.log('    ********************** Reality Checks ****************')
  console.log('    total_meters - ', trip.total_meters)
  console.log('    user_meters_per_day - ', trip.user_meters_per_day)
  console.log('    length of second leg - ', trip.leg_distances[1])
  //console.log('    total mi - ', trip.total_mi)
  //console.log('    miles_per_day - ', trip.miles_per_day)
  console.log('    trip_points.length - ', trip.trip_points.length)  
  console.log('    meter_counts.length - ', trip.meter_counts.length)
  console.log('    num_segments - ', trip.num_segments)
  console.log('    way_points.length - ', trip.way_points.length)
  console.log('    leg_distances.length - ', trip.leg_distances.length)
  console.log('    num_legs - ', trip.num_legs)
  console.log('    num_legs_round - ', trip.num_legs_round)
  console.log('    segments_per_leg - ', trip.segments_per_leg)
  console.log('    segments_per_leg_round - ', trip.segments_per_leg_round)
  console.log("    'leftover' segments - ", trip.leftovers)
  console.log(`    ${trip.segments_per_leg_round}  *  ${trip.num_legs_round-1}  +  ${trip.leftovers}  =  ${trip.num_segments}`)
  console.log('    ******************************************************')
  console.log(' ')
  return trip
}

function checkLegDistances(trip) {
  // this function for testing during development - can be commented out
  let total = 0;
  let avg = 0;
  let array_1 = []
  let other_total = 0;
  let other_avg = 0;
  // get average leg distance
  for (let i = 0; i < trip.leg_distances.length-1; i++) {
    total += trip.leg_distances[i]
  }
  avg = total/trip.leg_distances.length-1;
  console.log('average leg distance - ', avg)
  // get amounts of variation from average
  for (let j = 0; j < trip.leg_distances.length-1; j++) {
    let temp = trip.leg_distances[j] - avg
    let temp1 = Math.abs(temp);
    array_1.push(temp1)
  }
  // get average difference
  for (let k = 0; k < array_1.length; k++) {
    other_total += array_1[k]
  }
  other_avg = other_total/array_1.length;
  console.log('Are leg distances improving? (less is better) - ', other_avg)
}

function getMeterCounts(trip) {
   // Create an array of estimated meter accumulation at each trip_point
   // based on num_segments_in_leg_array
  let { segments_per_leg_round, num_legs_round, leg_distances, leftovers, 
    segments_per_leg } = trip;
  trip.meter_counts = [0]; 
  let running_total = 0;
  let current_step;     
  let temp_num_segments = segments_per_leg_round;
  let count = 0;

  for( let i = 0; i < num_legs_round; i++) {
      current_step = leg_distances[i]/trip.num_segments_in_leg_array[i]
      // console.log('                i -', i, leg_distances[i], current_step)      

    for( let j = 0; j < trip.num_segments_in_leg_array[i]; j++) {
      running_total += current_step
      // console.log('   j -> ', j, count, running_total)
      count = count + 1
      trip.meter_counts.push(Math.round(running_total));
    }
  }
  return trip
}

function setUrlWithWayPoints(trip) {
  let { way_points } = trip
  trip.trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=`
  trip.trip_url +=  way_points[0] + "&destination=" + way_points[way_points.length -1] + "&waypoints=";
  for (let i = 1; i < trip.way_points.length-1; i++) {
    trip.trip_url += way_points[i];
    if (i !== trip.way_points.length-2) {
      trip.trip_url += '|';
    }
  }
  trip.trip_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return trip
}

function findMeterCountAtBreakPoints(trip) {
  let { meter_counts, trip_points, user_meters_per_day } = trip
  let new_way_point;
  let new_way_points = [];
  let targets = [];
  trip.way_points_set = [];
  let break_point = user_meters_per_day
  let target_meters = break_point
  // prev, next are points on either side of the selected point
  // Although not implemented yet, these points will provide 
  // additional areas to search when results come back empty
  let way_pt_obj = {prev: {}, stop: {}, next: {}}
  let cutoff, diff
  let count_to_next_hit = 0;
  trip.num_segments_in_leg_array = [];
  // find value closest to each stopping point - 'target_meters'. 
  // Create an object w/ info for point and push to trip.way_points_set.
  for ( let b = 0; b < trip.meter_counts.length; b++ ) {
    way_pt_obj = {prev: {}, stop: {}, next: {}}
    // if first one, we have start point already
    if (b == 0) {
      //console.log('---------------->>> FIRST ONE!  b - ', b , '    (we have start point already)')
      new_way_point = trip_points[b]
      new_way_points.push(new_way_point) 
      way_pt_obj.prev.points = null
      way_pt_obj.stop.points = trip_points[b]
      if (isNaN(trip.meter_counts[b+1])) {
        way_pt_obj.next.points = null
      }
      else {
        way_pt_obj.next.points = trip_points[b+1]
      }
      //console.log('way_pt_obj - ', way_pt_obj)
      trip.way_points_set.push(way_pt_obj)
    }
    // if last one
    if (b == trip.meter_counts.length-1) {
      new_way_point = trip_points[b]
      new_way_points.push(new_way_point) 
      trip.num_segments_in_leg_array.push(count_to_next_hit)
      //console.log('---------------->>> LAST ONE!  b - ', b, meter_counts[b], new_way_point, count_to_next_hit)
      way_pt_obj.next.points = null;
      way_pt_obj.stop.points = trip_points[b]
      if (isNaN(trip.meter_counts[b-1])) {
        way_pt_obj.prev.points = null
      }
      else {
        way_pt_obj.prev.points = trip_points[b-1]
      }
      trip.way_points_set.push(way_pt_obj)
      continue
    } 
    // check if greater than target_meters
    else if (trip.meter_counts[b] > target_meters) {
      //console.log('---------------->>>  HIT!  b - ', b, meter_counts[b], new_way_point, count_to_next_hit)
      // if yes, select meter_count closer to break_point, either [b] or [b+1]
      // compare to cutoff point midway between: [b] or [b+1]

      trip.num_segments_in_leg_array.push(count_to_next_hit)
      count_to_next_hit = 0;
      diff = trip.meter_counts[b+1] - trip.meter_counts[b]
      cutoff = trip.meter_counts[b] + (diff/2) 
      if (trip.meter_counts[b] > cutoff) {
        new_way_point = trip_points[b+1]
        way_pt_obj.stop.points = trip_points[b+1]
        way_pt_obj.prev.points = trip_points[b]
        if (isNaN(trip.meter_counts[b+2])) {
          way_pt_obj.next.points = null 
        }
        else {
          way_pt_obj.next.points = trip_points[b+2]
        }
      }
      else {
        new_way_point = trip_points[b]
        way_pt_obj.stop.points = trip_points[b]
        way_pt_obj.prev.points = trip_points[b-1] 
        way_pt_obj.next.points = trip_points[b]
      }
      target_meters += break_point
      new_way_points.push(new_way_point) 
      trip.way_points_set.push(way_pt_obj)
    }
    count_to_next_hit += 1;
  }
  trip.exports.way_points_set = trip.way_points_set
  //console.log('==============>>>>  num_segments_in_leg_array - ',trip.num_segments_in_leg_array)
  //console.log('==============>>>>  leg_distances - ', trip.leg_distances)
  return new_way_points
}

function calibrateMeterCounts(trip) {
  // compensates for one kind of inaccuracy
  if (trip.total_meters > trip.meter_counts[trip.meter_counts.length-1]) {
    trip.correction_factor = (trip.total_meters - trip.meter_counts[trip.meter_counts.length-1])/trip.total_meters
  }
  else {
    trip.correction_factor = (trip.meter_counts[trip.meter_counts.length-1] - trip.total_meters)/trip.total_meters
  }
  for( let k = 0; k < trip.meter_counts.length; k++) {
    trip.meter_counts[k] = trip.meter_counts[k]*(trip.correction_factor+1)
  }
  return trip
}

function recalculateWayPoints(trip) {
  // recalculation is definitely needed for some routes
  // (ie Seattle to Miami at 650 mi per day) 
  // but for other routes it may be unnecessary 
  // (i.e. Singapore to Hanoi at 100 mi per day)
  let { total_mi, total_meters, miles_per_day, user_meters_per_day, 
    num_segments, num_legs, num_legs_round, leftovers, way_points, 
    trip_points, meter_counts } = trip;
  trip.leg_distances = []
  setUrlWithWayPoints(trip)
  return axios.get(trip.trip_url)
    .then(response => {
      // get current leg distances from response
      let leg_set = response.data.routes[0].legs
      for(  let i = 0; i < leg_set.length; i++) {
        trip.leg_distances.push(leg_set[i].distance.value)
      }
      // create exports object for res.json
      trip.exports = {
        way_points:  trip.way_points,
        response: response.data
      }
      getMeterCounts(trip)

      calibrateMeterCounts(trip) 

      trip.way_points = findMeterCountAtBreakPoints(trip)
      console.log(' ')
      console.log('   Recalculated way_points - ')
      console.log(trip.way_points)
      return trip
    })
    .catch(function(error) {
      console.log(error);
    });
}

function createTestUrl(trip) {
  // creates a normal url (not to API) for reality check on waypoints
  let { way_points } = trip
  trip.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < trip.way_points.length; i++) {
    trip.test_url += trip.way_points[i];
      trip.test_url += '/';
  }
  trip.test_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  trip.exports.test_url = trip.test_url
  console.log('Test url - ', trip.test_url)
  console.log(' ')
  return trip
}

function createPlacesUrl(points) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=` +
  + points[0] + ',' + points[1] + `&radius=7000&type=lodging&key=AIzaSyDZSeVvDKJQFTgtYkjzOe368PIDbaq6OQE`
 //console.log("url -  ", url)
 return url
}

function searchForPlaces(trip, item) {
  // this function is sometimes called extra times, unnecessarily
  //console.log('searchForPlaces()   ==============> - ', item.points)
  let info_url = createPlacesUrl(item.points)
  item.places = []
  return axios.get(info_url)
    .then(response => {
      if(response.data.results[0]) {
        //console.log('============>>>>>> here comes - ', response.data.results[0])
        // builds the places object
        // basic version, just gives the top item in search results
        // could filter results based on user input 
        for(let j = 0; j < response.data.results.length; j++) {
          let temp_result = {}
          temp_result.name = response.data.results[j].name
          temp_result.vicinity = response.data.results[j].vicinity
        
          if (response.data.results[j].photos) {
            temp_result.photos = [];
            temp_result.photos.push(response.data.results[j].photos[0].photo_reference)
          }
          temp_result.rating = response.data.results[j].rating
          //console.log('++++++++++++++++++++  temp_result - ', temp_result)
          item.places.push(temp_result)
        }
        return trip
      } 
    })
    .catch(function(error) {
      console.log(error);
    });
}
// example of correct url for google places API:
// https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key=AIzaSyDZSeVvDKJQFTgtYkjzOe368PIDbaq6OQE

function searchForAllPlaces(trip) {
  let count = 0;
  let promises = [];
  // iterate each way point set, which consists of three separate points near the stopping point
  // doing a lot of unnecessary calls here because not using results for prev and next :(
  for (let i = 1; i < trip.exports.way_points_set.length; i++) { 
    // do three searches for way_points_set, one for each of the three
    promises.push(searchForPlaces(trip, trip.exports.way_points_set[i].stop))
    if (trip.exports.way_points_set[i].prev.points) {
      promises.push(searchForPlaces(trip, trip.exports.way_points_set[i].prev))
    }
    if (trip.exports.way_points_set[i].next.points) {
      promises.push(searchForPlaces(trip, trip.exports.way_points_set[i].next))
    }
  }
  return Promise.all(promises)
  .then(results => { 
    return trip
  })
  .catch(function(error) {
    console.log(error);
  });
}

function createStopInfo(trip) {

  return trip
}

function createTripController(req, res, next) {
    if(!isValidTripInput(req.body)) {
      next({message: 'Invalid or missing input'});
    }
    else {
      let trip = processUserInput(req.body)
      let promise_1 = firstSimpleRequest(trip)
      return promise_1
      .then(response => {
        extractTripPoints(response, trip)
        calcFirstWayPoints(trip)
        console.log('   ==============>>>>  promise_1     complete  -----------------')
        //console.log('   trip.trip_points 1 - ', trip.trip_points)
        let promise_2 = recalculateWayPoints(trip)    
        return promise_2
        .then(trip => {
          console.log('   ==============>>>>  promise_2    complete  -----------------')
          let promise_3 = recalculateWayPoints(trip)      
          return promise_3
          .then(trip => {
            console.log('   ==============>>>>  promise_3    complete  -----------------')
            let promise_4 = recalculateWayPoints(trip)      
            return promise_4
              .then(trip => {
                console.log('   ==============>>>>  promise_4     complete  -----------------')
                printRecalcResults(trip) 
                createTestUrl(trip)
                searchForAllPlaces(trip)
                  .then(trip => {
                    res.json(trip.exports)
                  })
                  .catch(err => {
                    console.log(err)
                  })
              })
              .catch(function(error) {
                // console.log('Channthy Kak 1980-2018 - the soaring voice of Khmer Rock')
                console.log(error);
            });
        })
      })
    })

      // save trip to db
      //   model.trips.createTrip(req.body)
      //   .then(trips => {
      //   res.status(201).json(trips[0]);
      // })
    
  }
        // .catch(function(error) {
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