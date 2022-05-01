const axios = require('axios');
// const GMkey = process.env.gmKey;
const GMkey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

// variables for creating way_points are defined in first_setup.js

function checkLegDistances(leg_distances) { // for debugging
  let total = 0;
  let avg = 0;
  let array_1 = [];
  let other_total = 0;
  let other_avg = 0;
  // get average leg distance
  for (let i = 0; i < leg_distances.length - 1; i++) {
    total += leg_distances[i]
  }
  avg = total / leg_distances.length - 1;
  console.log('average leg distance - ', avg)
  // get amounts of variation from average
  for (let j = 0; j < leg_distances.length - 1; j++) {
    let temp = leg_distances[j] - avg
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

function createTestUrl(factory) {
  // create normal url (not to API) for checking way points
  let { way_points } = factory
  factory.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < factory.way_points.length; i++) {
    factory.test_url += factory.way_points[i];
    factory.test_url += '/';
  }
  factory.test_url = `${factory.test_url}&key=${GMkey}`;
  // console.log('factory.test_url (for checking waypoints):>> ', factory.test_url);
  return factory.test_url;
}

function getMeterCounts(factory) {
  // Create array of estimated meter accumulation at each all_point
  // based on num_segments_in_leg_array
  let { segments_per_leg_round, num_legs_round, leg_distances } = factory;
  factory.meter_counts = [0];
  let running_total = 0;
  let current_step;
  let count = 0;

  for (let i = 0; i < num_legs_round; i++) {
    current_step = leg_distances[i] / factory.num_segments_in_leg_array[i]

    for (let j = 0; j < factory.num_segments_in_leg_array[i]; j++) {
      running_total += current_step
      count += 1
      factory.meter_counts.push(Math.round(running_total));
    }
  }
  return factory
}

function calibrateMeterCounts(factory) {
  // compensate for minor compounding inaccuracy
  let { total_meters, meter_counts } = factory;
  let correction_factor;
  if (total_meters > meter_counts[meter_counts.length - 1]) {
    correction_factor = (total_meters - meter_counts[meter_counts.length - 1]) / total_meters
  }
  else {
    correction_factor = (meter_counts[meter_counts.length - 1] - total_meters) / total_meters
  }
  for (let k = 0; k < meter_counts.length; k++) {
    meter_counts[k] = meter_counts[k] * (correction_factor + 1)
  }
  return factory
}

function findMeterCountAtBreakPoints(factory) {
  let { meter_counts, way_points, all_points, way_pts_indexes, meters_per_interval, num_segments_in_leg_array } = factory;
  let break_point = meters_per_interval;
  let target_meters = break_point;
  let cutoff, diff;
  let count_to_next_hit = 0;
  // find value closest to each stopping point - 'target_meters'. 
  for (let b = 0; b < meter_counts.length; b++) {
    // if first one
    if (b === 0) {
      way_points.push(all_points[b])
      way_pts_indexes.push(b)
    }
    // if last one
    if (b === meter_counts.length - 1) {
      way_points.push(all_points[b])
      way_pts_indexes.push(b)
      num_segments_in_leg_array.push(count_to_next_hit)
      continue // last one, no further calculations
    }
    // check if greater than target_meters
    else if (meter_counts[b] > target_meters) {
      // select meter_count closer to break_point, either [b] or [b+1]
      // compare to cutoff point midway between: [b] or [b+1]
      num_segments_in_leg_array.push(count_to_next_hit)
      count_to_next_hit = 0;
      diff = meter_counts[b + 1] - meter_counts[b]
      cutoff = meter_counts[b] + (diff / 2)
      if (meter_counts[b] > cutoff) {
        way_points.push(all_points[b + 1])
        way_pts_indexes.push(b + 1)
      }
      else {
        way_points.push(all_points[b])
        way_pts_indexes.push(b)
      }
      target_meters += break_point
    }
    count_to_next_hit += 1;
  }
}

function setUrlWithWayPoints(trip) {
  let { way_points, trip_url } = trip;
  trip.trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=${way_points[0]}&destination=${way_points[way_points.length - 1]}&waypoints=`;
  for (let i = 1; i < trip.way_points.length - 1; i++) {
    trip.trip_url += way_points[i];
    if (i !== trip.way_points.length - 2) {
      trip.trip_url += '|';
    }
  }
  trip.trip_url = `${trip.trip_url}&key=${GMkey}`;
  return trip
}

function getExtraWayPoints(factory) {
  let { all_points, way_pts_indexes, way_points_extra } = factory
  let way_pt_obj;
  // prev, next are points on either side of selected point (stop)
  // they provide additional locations to search when 
  // results come back empty (not implemented yet)
  // Todo - only search for hotels at rest_stops, not while enroute
  for (let a = 0, i = 0; a < all_points.length; a++) {
    way_pt_obj = { prev: null, stop: null, next: null }
    if (all_points[a] === way_pts_indexes[i]) {
      if (i === 0) { // 1st wayPt  
        way_pt_obj.stop = [...all_points[a]]
        way_pt_obj.next = [...all_points[a + 1]]
        i++
      }
      else if (i === way_pts_indexes.length) { // last wayPt 
        way_pt_obj.prev = [...all_points[a - 1]]
        way_pt_obj.stop = [...all_points[a]]
        i++
      }
      else {
        way_pt_obj.prev = [...all_points[a - 1]]
        way_pt_obj.stop = [...all_points[a]]
        way_pt_obj.next = [...all_points[a + 1]]
        i++
      }
      way_points_extra.push(way_pt_obj)
    }
  }
}

function isResultFinal(result, old_A, old_B, old_C) {
  // Often calculation of way points doesn't stabilize 
  // Rather they keep flipping between two or three very similar solutions
  // Thus it's necessary to compare current solution to 
  // the TWO previous solutions
  let answer = false;
  if ((JSON.stringify(result) === JSON.stringify(old_A)) ||
    (JSON.stringify(result) === JSON.stringify(old_B)) ||
    (JSON.stringify(result) === JSON.stringify(old_C))) {
    answer = true;
  }
  return answer;
}

function savePreviousData(f) { // to determine if done yet
  f.way_pts_D_indexes = f.way_pts_C_indexes;
  f.way_pts_C_indexes = f.way_pts_B_indexes;
  f.way_pts_B_indexes = f.way_pts_indexes;
  f.way_pts_indexes = [];

  f.way_points_D = f.way_points_C
  f.way_points_C = f.way_points_B
  f.way_points_B = f.way_points;
  f.way_points = [];
}

function pullDataFromResponse(response, leg_distances) {
  // pull out current leg distances from response
  let leg_set = response.data.routes[0].legs
  for (let i = 0; i < leg_set.length; i++) {
    leg_distances.push(leg_set[i].distance.value)
  }
}

const fixWayPoints = async (req, res, next) => {
  let { overview } = req.payload.data.trip;
  let iterations = 2
  let isFinal = false;

  while (!isFinal) {
    req.factory.leg_distances = []
    setUrlWithWayPoints(req.factory)
    // after building url, rename way_points and way_pts_indexes:
    savePreviousData(req.factory)
    // fetch data for recalculating way_points
    // need distances between most recent way_points
    let response = await axios.get(req.factory.trip_url)
    pullDataFromResponse(response, req.factory.leg_distances);
    getMeterCounts(req.factory)
    calibrateMeterCounts(req.factory)
    findMeterCountAtBreakPoints(req.factory)
    isFinal = isResultFinal(
      req.factory.way_pts_indexes,
      req.factory.way_pts_B_indexes,
      req.factory.way_pts_C_indexes,
      req.factory.way_pts_D_indexes,
      iterations);
    iterations++;
    // for development, use iterations > 2, for less perfect route.
    // for production, use iterations > 6:
    if (isFinal || iterations > 2) {  // if last iteration
      isFinal = true;
      // save final route details
      overview.summary = response.data.routes[0].summary;
      overview.bounds = response.data.routes[0].bounds;
      overview.total_meters = req.factory.total_meters;
      overview.total_mi = Math.round(overview.total_meters / 1609.34);
      overview.intervals_per_day = req.factory.intervals_per_day;
      req.factory.legs = response.data.routes[0].legs;

      createTestUrl(req.factory); // url for debugging
    }
  }
  return req;
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
