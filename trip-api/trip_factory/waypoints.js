const axios = require('axios');
// const GMkey = process.env.gmKey;
const GMkey = 'AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac';

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
      // implement later to search for hotels and truck stops
      // way_points_extra.push(way_pt_obj)
    }
  }
}

function createTestUrl(factory) {
  // create test url (not to API) for checking way points
  let { way_points } = factory
  factory.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < factory.way_points.length; i++) {
    factory.test_url += factory.way_points[i];
    factory.test_url += '/';
  }
  factory.test_url = `${factory.test_url}&key=${GMkey}`;
  return factory.test_url;
}

function savePreviousWaypoints(f) { //
  f.way_pts_prev_idxs = f.way_pts_indexes;
  f.way_pts_prev = f.way_points;
}

function getLegDistances(route, leg_distances) {
  let leg_set = route.legs;
  //leg_distances = [];
  // console.log('     *');
  // console.log('   ***  New leg distances from new geo data');
  // this if/else is only necessary because leg_distances array is behaving weirdly
  if (leg_distances.length > 0) {
    for (let i = 0; i < leg_set.length; i++) {
      leg_distances[i] = leg_set[i].distance.value;
      // console.log(`leg ${i}   ${leg_set[i].distance.text} ${leg_set[i].distance.value} > ${leg_set[i].start_address}  ==> ${leg_set[i].end_address}`);
    }
  }
  else {
    for (let i = 0; i < leg_set.length; i++) {
      leg_distances.push(leg_set[i].distance.value);
      // console.log(`leg ${i}   ${leg_set[i].distance.text} ${leg_set[i].distance.value} > ${leg_set[i].start_address}  ==> ${leg_set[i].end_address}`);
    }
  }
  // console.log('     *');
}

function setUrlWithWayPoints(factory) {
  let { way_points, trip_url } = factory;
  factory.trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=${way_points[0]}&destination=${way_points[way_points.length - 1]}&waypoints=`;
  for (let i = 1; i < factory.way_points.length - 1; i++) {
    factory.trip_url += way_points[i];
    if (i !== factory.way_points.length - 2) {
      factory.trip_url += '|';
    }
  }
  factory.trip_url = `${factory.trip_url}&key=${GMkey}`;
  // console.log(`factory.trip_url`, factory.trip_url)
}

// const showRevisedData = (factory) => {
//   console.log('     * =================================================')
//   console.log('   ***  Revised data - new way points')
//   console.log(`   all_points.length      `, factory.all_points.length)
//   console.log('   meter_counts.length    ', factory.meter_counts.length);
//   console.log(`   total_units            `, factory.total_units)
//   console.log('   last item meter_counts ', factory.meter_counts[factory.meter_counts.length - 1]);
//   console.log(`   total_meters           `, factory.total_meters)
//   console.log('    leg_distances.length  ', factory.leg_distances.length);
//   console.log('    leg_distances         ', factory.leg_distances);
//   console.log('       *');
//   console.log('   way_points.length      ', factory.way_points.length);
//   console.log(`   way_pts_indexes.length `, factory.way_pts_indexes.length)
//   console.log(`   way_pts_indexes        `, factory.way_pts_indexes)
//   console.log('   track_units_per_leg.length ', factory.track_units_per_leg.length);
//   console.log('   track_units_per_leg        ', factory.track_units_per_leg);
//   let track_units = 0;
//   for (let i = 0; i < factory.track_units_per_leg.length; i++) {
//     track_units += factory.track_units_per_leg[i];
//   }
//   console.log('   sum of track_units     ', track_units);
//   console.log('     ***    Next!')
//   console.log('')
// }

function getMeterCounts(factory) {
  /*
  // Goal - Make revised estimate of meter count at each all_point based on: 
  // 1) leg distance
  // 2) all_point_index - get from way_pts_indexes
  // 3) track_units_per_leg
  // Save running_total for each all_point so you end up with 
  // array of meter_counts, one for each all_point

  // estimated meter count is calculated using leg distances, 
  // therefore iterate leg_distances
  // for each leg_distance -
  //    - calculate size of step 
  //         size_of_step = size of leg in meters/number of units in leg 
  //            (get total_units from track_units_per_leg)
  //    - go through indexes of all_points for this leg, but don't touch all_points,
  //         use all_point indexes from way_pts_indexes 
  */
  let { leg_distances, way_pts_indexes } = factory;
  let running_total = 0;
  let size_of_step = 0;
  let all_pt_count = 0;
  let units_per_leg_count;
  factory.meter_counts = [0]; // set first meter_count (starting point) to 0

  for (let i = 0; i < leg_distances.length; i++) {
    // recalculate size_of_step for current leg distance
    size_of_step = leg_distances[i] / factory.track_units_per_leg[i];
    // loop through points in current leg_distance, stops at next way_pt_idx:
    for (let j = all_pt_count; j < way_pts_indexes[i + 1]; j++) {
      running_total += size_of_step;
      // push running_total (meter count for this all_point) to meter_counts
      factory.meter_counts.push(Math.round(running_total));
      all_pt_count++;
    }
  }
  // replace last meter_count with total_meters, removes compounding error
  factory.meter_counts.pop();
  factory.meter_counts.push(factory.total_meters);
}

function selectNewWayPoints(factory) {
  /*
     find value closest to each stopping point (target_meters) 
     for each all_point -
       - compare to target
       - if less than target
            - increment running_total with size_of_step
            - go to next all_point
       - if more than target, 
            - check if this all-point is closer to target
              than previous all-point
*/
  // console.log('        *')
  // console.log('   *** select new way_points - use in 1st multi-stop call to google api')
  let { all_points, meter_counts, targets } = factory;
  savePreviousWaypoints(factory)
  factory.way_points = [];
  factory.way_pts_indexes = [];
  factory.track_units_per_leg = [];
  let target_idx = 0;
  let target_meters;
  let count_to_next_hit;
  for (let x = 0; x <= meter_counts.length; x++) {
    // loop iterates one past end of meter_counts bc meter_counts.length is
    // one less than all_points.length
    if (x === 0) {
      // console.log(` all_pt ${x}  value ${meter_counts[x]}  target ${target_meters} - 1st one`);
      factory.way_points.push(all_points[x]);
      factory.way_pts_indexes.push(x);
      target_idx++;
      target_meters = targets[target_idx];
      count_to_next_hit = 0;
    }
    // if last target or last meter_count
    else if (target_idx === targets.length - 1 || x === meter_counts.length - 1) { // for last one, we already know what the end point is
      // console.log(` all_pt ${all_points.length - 1}  value ${meter_counts[all_points.length - 1]}  target ${target_meters} - last one`);
      factory.way_points.push(all_points[all_points.length - 1]);
      factory.way_pts_indexes.push(all_points.length - 1);
      target_idx++;
      target_meters = targets[target_idx];
      factory.track_units_per_leg.push((all_points.length - 1) - factory.way_pts_indexes[factory.way_pts_indexes.length - 2]);
      break;
    }

    else if (meter_counts[x] >= target_meters) { // if went past target_meters
      // find out which is closer - [x] or [x-1]
      if (Math.abs(target_meters - meter_counts[x]) <=
        Math.abs(target_meters - meter_counts[x - 1])) // if current one is closer than previous
      {
        // console.log(` all_pt ${x}  value ${meter_counts[x]}  target ${target_meters}`);
        factory.way_points.push(all_points[x]);
        factory.way_pts_indexes.push(x);
        target_idx++;
        target_meters = targets[target_idx];
        count_to_next_hit++;
        factory.track_units_per_leg.push(count_to_next_hit);
        count_to_next_hit = 0;
      }
      else { // previous one is closer
        // console.log(` all_pt ${x - 1}  value ${meter_counts[x - 1]}  target ${target_meters}`);
        factory.way_points.push(all_points[x - 1]);
        factory.way_pts_indexes.push(x - 1);
        target_idx++;
        target_meters = targets[target_idx];
        factory.track_units_per_leg.push(count_to_next_hit);
        x--;
        count_to_next_hit = 0;
      }
    }
    else {  // if no hit
      count_to_next_hit += 1;
    }
  }
  // console.log('        *')
}

const getRouteData = (url) => {
  return axios.get(url);
}

const fixWayPoints = (req, res, next) => {
  let { overview } = req.payload.data.trip;
  req.factory.leg_distances = []
  setUrlWithWayPoints(req.factory)
  // fetch more data for recalculating way_points
  return getRouteData(req.factory.trip_url)
    .then(incoming => {
      // need distances between new way_points
      getLegDistances(incoming.data.routes[0], req.factory.leg_distances);
      // make tentative estimate of meter count at each all_points
      getMeterCounts(req.factory)
      // select new waypoints based on first geo data
      selectNewWayPoints(req.factory)
      // showRevisedData(req.factory)
      setUrlWithWayPoints(req.factory)
      return getRouteData(req.factory.trip_url)
        .then(incoming => {
          getLegDistances(incoming.data.routes[0], req.factory.leg_distances);
          // save final route details
          overview.summary = incoming.data.routes[0].summary;
          overview.bounds = incoming.data.routes[0].bounds;
          overview.total_meters = req.factory.total_meters;
          overview.total_mi = Math.round(overview.total_meters / 1609.34);
          overview.legs_per_day = req.factory.legs_per_day;
          req.factory.legs = incoming.data.routes[0].legs;
          return req;
        })
      //})
    })
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
