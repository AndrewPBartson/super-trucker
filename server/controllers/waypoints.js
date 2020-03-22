const axios = require('axios')

function checkLegDistances(trip) {
  // this function for testing during development - can be commented out
  let total = 0;
  let avg = 0;
  let array_1 = [];
  let other_total = 0;
  let other_avg = 0;
  // get average leg distance
  for (let i = 0; i < trip.leg_distances.length - 1; i++) {
    total += trip.leg_distances[i]
  }
  avg = total / trip.leg_distances.length - 1;
  console.log('average leg distance - ', avg)
  // get amounts of variation from average
  for (let j = 0; j < trip.leg_distances.length - 1; j++) {
    let temp = trip.leg_distances[j] - avg
    let temp1 = Math.abs(temp);
    array_1.push(temp1)
  }
  // get average difference
  for (let k = 0; k < array_1.length; k++) {
    other_total += array_1[k]
  }
  other_avg = other_total / array_1.length;
  console.log('Are leg distances improving? (less is better) - ', other_avg)
}

function getMeterCounts(trip) {
  // Create an array of estimated meter accumulation at each all_point
  // based on num_segments_in_leg_array
  let { segments_per_leg_round, num_legs_round, leg_distances } = trip;
  trip.meter_counts = [0];
  let running_total = 0;
  let current_step;
  let count = 0;

  for (let i = 0; i < num_legs_round; i++) {
    current_step = leg_distances[i] / trip.num_segments_in_leg_array[i]
    // console.log('                i -', i, leg_distances[i], current_step)      

    for (let j = 0; j < trip.num_segments_in_leg_array[i]; j++) {
      running_total += current_step
      // console.log('   j -> ', j, count, running_total)
      count += 1
      trip.meter_counts.push(Math.round(running_total));
    }
  }
  return trip
}

function calibrateMeterCounts(trip) {
  // compensates for one kind of inaccuracy
  if (trip.total_meters > trip.meter_counts[trip.meter_counts.length - 1]) {
    trip.correction_factor = (trip.total_meters - trip.meter_counts[trip.meter_counts.length - 1]) / trip.total_meters
  }
  else {
    trip.correction_factor = (trip.meter_counts[trip.meter_counts.length - 1] - trip.total_meters) / trip.total_meters
  }
  for (let k = 0; k < trip.meter_counts.length; k++) {
    trip.meter_counts[k] = trip.meter_counts[k] * (trip.correction_factor + 1)
  }
  return trip
}

function findMeterCountAtBreakPoints(req) {
  console.log('**** findMeterCounts()  req.trip.way_points_indexes :', req.trip.way_points_indexes);
  let { meter_counts, all_points, meters_per_day } = req.trip;
  let new_way_point;
  req.trip.new_way_points = [];
  req.trip.way_points_indexes = [];
  let break_point = meters_per_day
  let target_meters = break_point
  // prev, next are points on either side of selected point
  // they provide additional areas to search when 
  // results come back empty (not implemented yet)
  let cutoff, diff
  let count_to_next_hit = 0;
  // might not need this variable outside this function
  req.trip.num_segments_in_leg_array = [];
  // find value closest to each stopping point - 'target_meters'. 
  // Create an object w/ info for point and push to trip.way_points_set.
  for (let b = 0; b < meter_counts.length; b++) {
    if (b == 0) {  // if first one
      new_way_point = all_points[b]
      req.trip.new_way_points.push(new_way_point)
      req.trip.way_points_indexes.push(b)
    }
    // if last one
    if (b == meter_counts.length - 1) {
      new_way_point = all_points[b]
      req.trip.new_way_points.push(new_way_point)
      req.trip.way_points_indexes.push(b)
      req.trip.num_segments_in_leg_array.push(count_to_next_hit)
      //console.log('---------------->>> LAST ONE!  b - ', b, meter_counts[b], new_way_point, count_to_next_hit)
      continue // this is last one, no further calculations
    }
    // check if greater than target_meters
    else if (meter_counts[b] > target_meters) {
      //console.log('---------------->>>  HIT!  b - ', b, meter_counts[b], new_way_point, count_to_next_hit)
      // if yes, select meter_count closer to break_point, either [b] or [b+1]
      // compare to cutoff point midway between: [b] or [b+1]
      req.trip.num_segments_in_leg_array.push(count_to_next_hit)
      count_to_next_hit = 0;
      diff = meter_counts[b + 1] - meter_counts[b]
      cutoff = meter_counts[b] + (diff / 2)
      if (meter_counts[b] > cutoff) {
        new_way_point = all_points[b + 1]
        req.trip.way_points_indexes.push(b + 1)
      }
      else {
        new_way_point = all_points[b]
        req.trip.way_points_indexes.push(b)
      }
      target_meters += break_point
      req.trip.new_way_points.push(new_way_point)
    }
    count_to_next_hit += 1;
  }
  //console.log('==============>>>>  num_segments_in_leg_array - ',trip.num_segments_in_leg_array)
  //console.log('==============>>>>  leg_distances - ', trip.leg_distances)
  console.log('req.trip.new_way_points :', req.trip.new_way_points);
  console.log('req.trip.way_points_indexes :', req.trip.way_points_indexes);
  return req
}

function setUrlWithWayPoints(trip) {
  let { way_points } = trip
  trip.trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=`
  trip.trip_url += way_points[0] + "&destination=" + way_points[way_points.length - 1] + "&waypoints=";
  for (let i = 1; i < trip.way_points.length - 1; i++) {
    trip.trip_url += way_points[i];
    if (i !== trip.way_points.length - 2) {
      trip.trip_url += '|';
    }
  }
  trip.trip_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return trip
}

function getExtraWayPoints(req, res, next) {
  console.log('***** getExtra() req.trip.way_points_indexes :', req.trip.way_points_indexes);
  let { all_points, way_points_indexes, way_points_set } = req.trip
  let way_pt_obj;
  for (let a = 0, i = 0; a < all_points.length; a++) {
    way_pt_obj = { prev: null, stop: null, next: null }
    if (all_points[a] === way_points_indexes[i]) {
      if (i === 0) { // first wayPt  
        way_pt_obj.stop = [...trip.all_points[a]]
        way_pt_obj.next = [...trip.all_points[a + 1]]
        i++
      }
      else if (i === way_points_indexes.length) { // last wayPt 
        way_pt_obj.prev = [...trip.all_points[a - 1]]
        way_pt_obj.stop = [...trip.all_points[a]]
        i++
      }
      else {
        way_pt_obj.prev = [...trip.all_points[a - 1]]
        way_pt_obj.stop = [...trip.all_points[a]]
        way_pt_obj.next = [...trip.all_points[a + 1]]
        i++
      }
      way_points_set.push(way_pt_obj)
    }
  }
  return req
}

function reviewFinalData(trip) {
  console.log(`
      ********************** reviewFinalData() ****************
      total_meters -  ${trip.total_meters}
      meters_per_day -  ${trip.meters_per_day}
      length of second leg -  ${trip.leg_distances[1]}
      total mi -  ${trip.total_mi}
      miles_per_day -  ${trip.miles_per_day}
      all_points.length -  ${trip.all_points.length}  
      meter_counts.length -  ${trip.meter_counts.length}
      num_segments -  ${trip.num_segments}
      trip.way_points :
       ${trip.way_points}
      way_points.length -  ${trip.way_points.length}
      leg_distances.length -  ${trip.leg_distances.length}
      num_legs -  ${trip.num_legs}
      num_legs_round -  ${trip.num_legs_round}
      segments_per_leg -  ${trip.segments_per_leg}
      segments_per_leg_round -  ${trip.segments_per_leg_round}
      'leftover' segments -  ${trip.leftovers}
      ${trip.segments_per_leg_round}  *  ${trip.num_legs_round - 1}  +  ${trip.leftovers}  =  ${trip.num_segments}
      ******************************************************
   `)
  return trip
}

function recalculateWayPoints(req, res, next) {
  console.log('*** recalc() - req.trip.way_points_indexes :', req.trip.way_points_indexes);
  // if first iteration, old_way_points don't exist
  if (req.trip.old_way_points.length === 0) {
    console.log("old way points don't exist");
  } else {
    console.log('old_way_points exist!');
    // 1) Are current way_points same as old_way_points?
       // yes - return
       // no - continue
    // 2) Are way points improving? Create function that detects improvements or lack of.
        // yes - continue
        // no - Select best way point among finalists, then return
    let allMatching = true 
    for (let i = 1; i < req.trip.way_points.length - 1; i++) {
      for (let j = 0; j < req.trip.way_points[i].length; j++) {
        // console.log(`way_points[${i}][${j}] : ${req.trip.way_points[i][j]}`);
        // console.log(`old_points[${i}][${j}] : ${req.trip.old_way_points[i][j]}`);
        if (req.trip.way_points[i][j] !== req.trip.old_way_points[i][j]) {
          allMatching = false;
        }
      }
    }
    console.log(`
       allMatching : ${allMatching}`);
    if (allMatching) {
      console.log(`   *************  It's a match - way points finished *************`)
      reviewFinalData(req.trip)
      return req;
    }
  } 
  console.log('**************** create new way points! ****************')
  // delete old leg_distances
  req.trip.leg_distances = []
  // send request to obtain distances between most recent way_points
  setUrlWithWayPoints(req.trip)
  return axios.get(req.trip.trip_url)
    .then(response => {
      // get current leg distances from response
      let leg_set = response.data.routes[0].legs
      for (let i = 0; i < leg_set.length; i++) {
        req.trip.leg_distances.push(leg_set[i].distance.value)
      }
      req.trip.response = response.data;

      getMeterCounts(req.trip)
      calibrateMeterCounts(req.trip)
      findMeterCountAtBreakPoints(req)
      // The calculations of way points do not necessarily stabilize completely
      // There are often slight (insignificant) variations between iterations
      // At some number of iterations, call it done.
      // Solution -
      // Write a test to compare each set of way points to see how much it varies.
      console.log('Before replacing old way points -');
      console.log('req.trip.old_way_points :', req.trip.old_way_points);
      console.log('req.trip.way_points:', req.trip.way_points);
      console.log('req.trip.new_way_points :', req.trip.new_way_points);
      console.log(' ');
      req.trip.old_way_points = [];
      req.trip.old_way_points = req.trip.way_points;
      req.trip.way_points = req.trip.new_way_points;
      console.log('After replacing old way points -');
      console.log('req.trip.old_way_points :', req.trip.old_way_points);
      console.log('req.trip.way_points:', req.trip.way_points);
      console.log('req.trip.new_way_points :', req.trip.new_way_points);
      return recalculateWayPoints(req, res, next)
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  recalculateWayPoints,
  getExtraWayPoints
}
// function getWayPoints(req, res, next) {
//   // return getInitialTripData(req)  // promise 1
//   //   .then(response => {
//   //     console.log('   /*****************  first recalc starting  *****************/')
//       return recalculateWayPoints(req, res, next)  // promise 2  
//       // .then(req => {
//       //   console.log('   /*****************  promise_2    complete  *****************/')
//       //   return recalculateWayPoints(req)  // promise 3    
//       //     .then(req => {
//       //       console.log('   /*****************  promise_3    complete  *****************/')
//       //       return recalculateWayPoints(req)  // promise 4  
//       //     })
//       // })
//     // })
// }
