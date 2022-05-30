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

function saveOldWaypoints(f) { //
  f.way_pts_B_indexes = f.way_pts_indexes;
  f.way_points_B = f.way_points;
}

function getLegDistances(route, leg_distances) {
  let leg_set = route.legs;
  for (let i = 0; i < leg_set.length; i++) {
    leg_distances.push(leg_set[i].distance.value);
    console.log(`leg ${i}             start  ${leg_set[i].start_address}`);
    console.log(`       ${leg_set[i].distance.text}       end    ${leg_set[i].end_address}`);
  }
  console.log(' 1) leg_distances.length :>> ', leg_distances.length);
  console.log(' 1) leg_distances :>> ', leg_distances);
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

const saveKeyPoints = (factory) => {
  for (let i = 0; i < factory.way_pts_indexes.length; i++) {
    factory.key_pts.push({
      all_pt_idx: factory.way_pts_indexes[i],
      meters: factory.meter_counts[factory.way_pts_indexes[i]]
    })
  }
}

const sortKeyPoints = (req) => {
  console.log('req.factory.key_pts.sort(sortKeyPointsB) :>> ', req.factory.key_pts.sort(sortKeyPointsB));
  let diff;
  req.factory.key_pts = req.factory.key_pts.sort((a, b) => {
    diff = 0;
    if (a.all_pt_idx > b.all_pt_idx) {
      diff = 1;
    } else if (a.all_pt_idx < b.all_pt_idx) {
      diff = -1;
    }
    return diff;
  });
  // remove duplicates
  // req.factory.key_pts = req.factory.key_pts.filter((pt, i, a) => {
  //   a.findIndex(pt2 => (pt2.all_pt_idx === pt.all_pt_idx)) === i
  // })
}

const sortKeyPointsB = (a, b) => {
  let comparison = 0;
  if (a.all_pt_idx > b.all_pt_idx) {
    comparison = 1;
  } else if (a.all_pt_idx < b.all_pt_idx) {
    comparison = -1;
  }
  return comparison;
}

const checkWayPoints = (factory) => {
  let { key_pts, target_calcs } = factory;
  // remove duplicates from key_pts
  key_pts = key_pts.filter((pt, i, a) => a.findIndex(pt2 => (pt2.all_pt_idx === pt.all_pt_idx)) === i)

  // key_pts.filter((point, i, a) => {
  //   // return a.findIndex(v2=>(v2.id===v.id))===i)
  // })
  for (let i = 0; i < target_calcs.length; i++) {
    // only work on way_points that are not good
    if (!target_calcs[i].isGood) {
      // look for new good ones 
      // if key_pt (known location) is within 2 miles of target for way_pt
      if (Math.abs(key_pts[i].meters - target_calcs[i].target_meters) < 3218) {
        target_calcs[i].isGood = true;
      }
      else { // set up calculations for remaining bod ones
        // need neighboring key_pts (higher and lower)
        // if no indexes are in between neighboring key_pts, select closest one and call it good
      }
    }
  }
}

function getMeterCounts(factory) {
  /*
  // Goal - Make revised estimate of meter count at each all_point based on: 
  // 1) track_units_per_leg
  // 2) leg distance
  // 3) all_point_index - get from way_pts_indexes
  // Save running_total for each all_point so you end up with 
  // array of meter_counts, one for each all_point

  // estimated meter count is calculated using leg distances, 
  // therefore iterate leg_distances
  // for each leg_distance -
  //    - calculate size of step 
  //         size_of_step = size of leg in meters/number of units in leg 
  //            (get num_units from track_units_per_leg)
  //    - go through indexes of all_points for this leg, but don't actually touch all_points,
  //         just use all_point indexes from way_pts_indexes 
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
    // loop through points in current leg_distance, way_pt_idx tells when to stop
    for (let j = all_pt_count; j < way_pts_indexes[i + 1]; j++) {
      running_total += size_of_step;
      // push running_total (meter count for this all_point) to meter_counts
      factory.meter_counts.push(Math.round(running_total));
      all_pt_count++;
    }
  }
}

const saveTargetData = (factory, way_pt_idx, all_pt_idx, meter_count) => {
  if (factory.target_calcs[way_pt_idx]) {
    factory.target_calcs[way_pt_idx].estimate.est_idx = all_pt_idx;
    factory.target_calcs[way_pt_idx].estimate.meters = meter_count;
  }
}

function selectNewWayPoints(factory) {
  /*
//     find value closest to each stopping point - 'target_meters'. for each all_point -
//       - compare to target
//       - if less than target
//            - increment running_total with size_of_step
//            - go to next all_point
//       - if more than target, 
//            - check if this all-point is closer to target
//              than the next all-point
*/
  let { all_points, meter_counts, target_points } = factory;
  saveOldWaypoints(factory)
  factory.way_points = [];
  factory.way_pts_indexes = [];
  factory.track_units_per_leg = [];
  // target_idx starts at 1 bc target for first leg should not be zero
  let target_idx = 1;
  let target_meters;
  let count_to_next_hit = 0;

  for (let b = 0; b <= meter_counts.length; b++) {
    // loop iterates one past end of meter_counts bc meter_counts.length is
    // one less than all_points.length

    // Push first point regardless
    if (b === 0) {
      factory.way_points.push(all_points[b]);
      factory.way_pts_indexes.push(b);
      saveTargetData(factory, factory.way_points.length - 1, b, meter_counts[b])
      target_meters = target_points[target_idx];
      target_idx++;
      console.log(`i   ${b}, value   ${meter_counts[b]} / target ${target_meters} - 1st one`);
    }
    // if greater than target_meters && not the last one
    else if (meter_counts[b] >= target_meters && (!(b === meter_counts.length - 1))) {
      // went past target_meters, find out which is closer - [b] or [b-1]
      if (Math.abs(target_meters - meter_counts[b]) <=
        Math.abs(target_meters - meter_counts[b - 1])) // if current one is closer than previous
      {
        factory.way_points.push(all_points[b]);
        factory.way_pts_indexes.push(b);
        saveTargetData(factory, factory.way_points.length - 1, b, meter_counts[b])
        target_meters = target_points[target_idx];
        target_idx++;
        factory.track_units_per_leg.push(count_to_next_hit);
        count_to_next_hit = 0;
        console.log(`i ${b}, value ${meter_counts[b]} / target ${target_meters}`);
      }
      else { // previous one is closer
        count_to_next_hit--;
        factory.way_points.push(all_points[b - 1]);
        factory.way_pts_indexes.push(b - 1);
        saveTargetData(factory, factory.way_points.length - 1, b - 1, meter_counts[b])
        target_meters = target_points[target_idx];
        target_idx++;
        factory.track_units_per_leg.push(count_to_next_hit);
        count_to_next_hit = 0;
        console.log(`i ${b - 1}, value ${meter_counts[b - 1]} / target ${target_meters}`);
      }
    }
    // Push last point regardless
    else if (b === meter_counts.length - 1) {
      factory.way_points.push(all_points[all_points.length - 1]);
      factory.way_pts_indexes.push(all_points.length - 1);
      saveTargetData(factory, factory.way_points.length - 1, all_points.length - 1, meter_counts[all_points.length - 1])
      target_meters = target_points[target_idx];
      target_idx++;
      factory.track_units_per_leg.push(count_to_next_hit);
      console.log(`i ${all_points.length - 1}, value ${meter_counts[all_points.length - 1]} / target ${target_meters} - last one`);
    }
    else {  // if no hit
      count_to_next_hit += 1;
    }
  }
  console.log('     *')
  console.log('  **** 2) new way points')
  console.log(`   all_points.length`, factory.all_points.length)
  console.log(`   num_units`, factory.num_units)
  console.log('   meter_counts.length :>> ', meter_counts.length);
  console.log('   last item in meter_counts :>> ', meter_counts[meter_counts.length - 1]);
  console.log('       *');
  console.log('   all_points.length :>> ', all_points.length);
  console.log('   way_points.length :>> ', factory.way_points.length);
  console.log(`   way_pts_indexes.length`, factory.way_pts_indexes.length)
  console.log(`   way_pts_indexes`, factory.way_pts_indexes)
  console.log('   track_units_per_leg.length :>> ', factory.track_units_per_leg.length);
  console.log('   track_units_per_leg :>> ', factory.track_units_per_leg);
  console.log('     **** End 2)     *')
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
      // make better estimate of meter count at each all_point
      getMeterCounts(req.factory)
      saveKeyPoints(req.factory)
      // select new waypoints based on new meter count estimates
      selectNewWayPoints(req.factory)
      // checkLegDistances(req.factory.leg_distances)
      req.factory.leg_distances = []
      setUrlWithWayPoints(req.factory)
      // fetch more data for recalculating way_points
      return getRouteData(req.factory.trip_url)
        .then(incoming => {
          // need distances between new way_points
          getLegDistances(incoming.data.routes[0], req.factory.leg_distances);
          checkWayPoints(req.factory)
          // make better estimate of meter count at each all_point
          getMeterCounts(req.factory)
          saveKeyPoints(req.factory)
          sortKeyPoints(req);
          // select new waypoints based on new meter count estimates
          selectNewWayPoints(req.factory)
          // save final route details
          overview.summary = incoming.data.routes[0].summary;
          overview.bounds = incoming.data.routes[0].bounds;
          overview.total_meters = req.factory.total_meters;
          overview.total_mi = Math.round(overview.total_meters / 1609.34);
          overview.legs_per_day = req.factory.legs_per_day;
          req.factory.legs = incoming.data.routes[0].legs;

          // createTestUrl(req.factory); // url for debugging
          console.log('     *')
          console.log('  **** Done with way points')
          console.log('  final way_points.length :>> ', req.factory.way_points.length);
          console.log(`  final way_pts_indexes.length`, req.factory.way_pts_indexes.length)
          console.log(`  final way_pts_indexes`, req.factory.way_pts_indexes)
          console.log('  final track_units_per_leg.length :>> ', req.factory.track_units_per_leg.length);
          console.log('  final track_units_per_leg :>> ', req.factory.track_units_per_leg);
          console.log('  target_calcs :>> ', req.factory.target_calcs);
          console.log(`  key_pts`, req.factory.key_pts)
          console.log('     *')
          return req;
        })
    })
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
