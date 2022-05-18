const axios = require('axios');
// const GMkey = process.env.gmKey;
const GMkey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

// variables for creating way_points are defined in first_setup.js

function getExtraWayPoints(factory) {
  let { all_points, way_pts_indexes, way_points_extra } = factory
  let way_pt_obj;
  // prev, next are points on either side of selected point (stop)
  // they provide additional locations to search when 
  // results come back empty (not implemented yet)
  // For example, search for hotels at overnight stops
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
      // may implement later to search for hotels and truck stops
      // way_points_extra.push(way_pt_obj)
    }
  }
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

function checkLegDistances(leg_distances) { // for testing
  let total_legs = 0;
  let avg_leg = 0;
  let variations = [];
  let total_v = 0;
  let avg_v = 0;
  // get average leg distance
  for (let i = 0; i < leg_distances.length - 1; i++) {
    total_legs += leg_distances[i]
  }
  avg_leg = total_legs / leg_distances.length - 1;
  console.log('average leg distance - ', avg_leg)
  // get amounts of variation from average
  for (let j = 0; j < leg_distances.length - 1; j++) {
    let leg_v = leg_distances[j] - avg_leg
    let leg_v_abs = Math.abs(leg_v);
    variations.push(leg_v_abs)
  }
  // get average variation
  for (let k = 0; k < variations.length; k++) {
    total_v += variations[k]
  }
  avg_v = total_v / variations.length;
  console.log('Are leg distances improving? (less is better) - ', avg_v)
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

function pullDataFromResponse(route, leg_distances) {
  // pull out current leg distances from response
  let leg_set = route.legs
  for (let i = 0; i < leg_set.length; i++) {
    leg_distances.push(leg_set[i].distance.value)
  }
}

const pullKeyPtsFromResponse = (params) => {

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

// 1) Function to check
function getMeterCounts(factory) {
  // Take the current way_points (using index saved in track_segments_per_leg) and
  // calculate the meter accumulation at each way_point. Save 
  // the result in meter_counts and in key_pts.
  let { num_legs, leg_distances } = factory;
  factory.meter_counts = [0];
  let running_total = 0;
  let current_step;

  for (let i = 0; i < num_legs; i++) {
    current_step = leg_distances[i] / factory.track_segments_per_leg[i]

    for (let j = 0; j < factory.track_segments_per_leg[i]; j++) {
      running_total += current_step;
      factory.meter_counts.push(Math.round(running_total));
      // if this point is not already in key_pts
      // if (!factory.key_pts.some(e => e.main_idx === j)) {
      //   factory.key_pts.push({ main_idx: j, meters: running_total });
      // }
    }
  }
  return factory
}
// 2) Function to check
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
// 3) Function to check - it's not necessary to recalculate target_meters repeatedly
function findMeterCountAtBreakPoints(factory) {
  let { meter_counts, way_points, all_points, way_pts_indexes, meters_per_interval, track_segments_per_leg } = factory;
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
    // if last distance, last two way_points
    if (b === meter_counts.length - 1) {
      way_points.push(all_points[b])
      way_pts_indexes.push(b)
      track_segments_per_leg.push(count_to_next_hit)
      // add last way_point bc way_points.length is one more than legs.length
      way_points.push(all_points[all_points.length - 1])
      way_pts_indexes.push(all_points.length - 1)
      continue // last one, no further calculations
    }
    // check if greater than target_meters
    else if (meter_counts[b] > target_meters) {
      // select meter_count closer to break_point, either [b] or [b+1]
      // compare to cutoff point midway between: [b] or [b+1]
      track_segments_per_leg.push(count_to_next_hit)
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

const fixWayPoints = async (req, res, next) => {
  let { overview } = req.payload.data.trip;
  let iterations = 0
  let isFinal = false;

  while (!isFinal) {
    req.factory.leg_distances = []
    setUrlWithWayPoints(req.factory)
    // after building url, rename way_points and way_pts_indexes:
    savePreviousData(req.factory)
    // fetch data for recalculating way_points
    // need distances between most recent way_points
    let response = await axios.get(req.factory.trip_url)
    pullDataFromResponse(response.data.routes[0], req.factory.leg_distances);
    getMeterCounts(req.factory)
    calibrateMeterCounts(req.factory)
    findMeterCountAtBreakPoints(req.factory)
    checkLegDistances(req.factory.leg_distances)
    isFinal = isResultFinal(
      req.factory.way_pts_indexes,
      req.factory.way_pts_B_indexes,
      req.factory.way_pts_C_indexes,
      req.factory.way_pts_D_indexes,
      iterations);
    iterations++;
    // for development, use iterations > 2, for less perfect route.
    // for production, use iterations > 6:
    if (isFinal || iterations > 6) {  // if last iteration
      isFinal = true;
      // save final route details
      overview.summary = response.data.routes[0].summary;
      overview.bounds = response.data.routes[0].bounds;
      overview.total_meters = req.factory.total_meters;
      overview.total_mi = Math.round(overview.total_meters / 1609.34);
      overview.intervals_per_day = req.factory.intervals_per_day;
      req.factory.legs = response.data.routes[0].legs;

      // createTestUrl(req.factory); // url for debugging
    }
  }
  console.log('final way_points.length :>> ', req.factory.way_points.length);
  console.log('final way_points :>> ', req.factory.way_points);
  return req;
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
