const axios = require('axios')

function checkLegDistances(trip) {
  // for testing during development - can be commented out
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

function createTestUrl(trip) {
  // creates a normal url (not to API) for checking way points
  let { way_points } = trip
  trip.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < trip.way_points.length; i++) {
    trip.test_url += trip.way_points[i];
    trip.test_url += '/';
  }
  trip.test_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  // console.log('trip.test_url (for checking waypoints):>> ', trip.test_url);
  return trip.test_url;
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

    for (let j = 0; j < trip.num_segments_in_leg_array[i]; j++) {
      running_total += current_step
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
  let { meter_counts, all_points, meters_per_interval } = req.trip;
  req.trip.num_segments_in_leg_array = [];
  let break_point = meters_per_interval;
  let target_meters = break_point;
  let cutoff, diff;
  let count_to_next_hit = 0;
  // find value closest to each stopping point - 'target_meters'. 
  for (let b = 0; b < meter_counts.length; b++) {
    // if first one
    if (b == 0) {  
      req.trip.way_points.push(all_points[b])
      req.trip.way_points_indexes.push(b)
    }
    // if last one
    if (b == meter_counts.length - 1) {
      req.trip.way_points.push(all_points[b])
      req.trip.way_points_indexes.push(b)
      req.trip.num_segments_in_leg_array.push(count_to_next_hit)
      continue // last one, no further calculations
    }
    // check if greater than target_meters
    else if (meter_counts[b] > target_meters) {
      // select meter_count closer to break_point, either [b] or [b+1]
      // compare to cutoff point midway between: [b] or [b+1]
      req.trip.num_segments_in_leg_array.push(count_to_next_hit)
      count_to_next_hit = 0;
      diff = meter_counts[b + 1] - meter_counts[b]
      cutoff = meter_counts[b] + (diff / 2)
      if (meter_counts[b] > cutoff) {
        req.trip.way_points.push(all_points[b + 1])
        req.trip.way_points_indexes.push(b + 1)
      }
      else {
        req.trip.way_points.push(all_points[b])
        req.trip.way_points_indexes.push(b)
      }
      target_meters += break_point
    }
    count_to_next_hit += 1;
  }
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
  let { all_points, way_points_indexes, way_points_set } = req.trip
  let way_pt_obj;
  // prev, next are points on either side of selected point (stop)
  // they provide additional areas to search when 
  // results come back empty (not implemented yet)
  for (let a = 0, i = 0; a < all_points.length; a++) {
    way_pt_obj = { prev: null, stop: null, next: null }
    if (all_points[a] === way_points_indexes[i]) {
      if (i === 0) { // 1st wayPoint  
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
      miles_per_half_day -  ${trip.miles_per_half_day}
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

function isResultFinal(result, old_A, old_B, old_C, iterations) {
  // In most cases, the calculations of way points do not stabilize. 
  // Rather they keep flipping between two (or three) very similar solutions.
  // That's why it's necessary to compare current solution to 
  // previous solution AND the solution before that
  let answer = false;
    if ((JSON.stringify(result) === JSON.stringify(old_A)) || 
        (JSON.stringify(result) === JSON.stringify(old_B)) || 
        (JSON.stringify(result) === JSON.stringify(old_C))) {
      answer = true;
    }
    // for debugging:
    console.log('                                                    old : ' + JSON.stringify(old_A));
    console.log('iteration ' + iterations + '  :  '+  JSON.stringify(result)); 
  return answer;
}

function savePreviousData (req) {
  req.trip.old_way_pts_3_indexes = req.trip.old_way_pts_2_indexes;
  req.trip.old_way_pts_2_indexes = req.trip.old_way_pts_indexes;
  req.trip.old_way_pts_indexes = req.trip.way_points_indexes;
  req.trip.way_points_indexes = [];

  req.trip.old_way_points_3 = req.trip.old_way_points_2
  req.trip.old_way_points_2 = req.trip.old_way_points
  req.trip.old_way_points = req.trip.way_points;
  req.trip.way_points = [];
}

function pullDataFromResponse(response, req) {
  // pull out current leg distances from response
  let leg_set = response.data.routes[0].legs
  for (let i = 0; i < leg_set.length; i++) {
    req.trip.leg_distances.push(leg_set[i].distance.value)
  }
  req.trip.response = response.data;
}

const fixWayPoints = async (req, res, next) => {
  let iterations = 2
  let isFinal = false;

  while (!isFinal) {
    req.trip.leg_distances = []
    setUrlWithWayPoints(req.trip)
    // after building url, rename way_points and way_points_indexes:
    savePreviousData(req)
    // fetch data for recalculating way_points
    // need distances between most recent way_points
    let response = await axios.get(req.trip.trip_url)
    pullDataFromResponse(response, req);
    getMeterCounts(req.trip)
    calibrateMeterCounts(req.trip)
    findMeterCountAtBreakPoints(req)
    isFinal = isResultFinal(
      req.trip.way_points_indexes, 
      req.trip.old_way_pts_indexes, 
      req.trip.old_way_pts_2_indexes, 
      req.trip.old_way_pts_3_indexes,
      iterations);
    iterations++;
    // if last iteration, add raw route data and test url to response for debugging and stuff
    // for development, use iterations > 2, produces less polished route
    // for production, use iterations > 6:
    if (isFinal || iterations > 2) {
      isFinal = true;
      req.trip.response.raw_data = response;
      createTestUrl(req.trip);
    }   
  }
  return req;
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
