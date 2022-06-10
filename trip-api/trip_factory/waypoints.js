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
  console.log('     *');
  console.log('   ***  New leg distances from new geo data');
  // this if/else is only necessary because leg_distances array is behaving weirdly
  if (leg_distances.length > 0) {
    for (let i = 0; i < leg_set.length; i++) {
      leg_distances[i] = leg_set[i].distance.value;
      console.log(`leg ${i}   ${leg_set[i].distance.text}  > ${leg_set[i].start_address}  ==> ${leg_set[i].end_address}`);
    }
  }
  else {
    for (let i = 0; i < leg_set.length; i++) {
      leg_distances.push(leg_set[i].distance.value);
      console.log(`leg ${i}   ${leg_set[i].distance.text}  > ${leg_set[i].start_address}  ==> ${leg_set[i].end_address}`);
    }
  }
  console.log('     *');
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
  console.log(`factory.trip_url`, factory.trip_url)
}

const showRevisedData = (factory) => {
  console.log('     * =================================================')
  console.log('   ***  Revised data - new way points')
  console.log(`   all_points.length      `, factory.all_points.length)
  console.log('   meter_counts.length    ', factory.meter_counts.length);
  console.log(`   total_units            `, factory.total_units)
  console.log('   last item meter_counts ', factory.meter_counts[factory.meter_counts.length - 1]);
  console.log(`   total_meters           `, factory.total_meters)
  console.log('    leg_distances.length  ', factory.leg_distances.length);
  console.log('    leg_distances         ', factory.leg_distances);
  console.log('       *');
  console.log('   way_points.length      ', factory.way_points.length);
  console.log(`   way_pts_indexes.length `, factory.way_pts_indexes.length)
  console.log(`   way_pts_indexes        `, factory.way_pts_indexes)
  console.log('   track_units_per_leg.length ', factory.track_units_per_leg.length);
  console.log('   track_units_per_leg        ', factory.track_units_per_leg);
  let track_units = 0;
  for (let i = 0; i < factory.track_units_per_leg.length; i++) {
    track_units += factory.track_units_per_leg[i];
  }
  console.log('   sum of track_units     ', track_units);
  console.log('   target_calcs.length    ', factory.target_calcs.length);
  // console.log('   target_calcs  ', factory.target_calcs);
  console.log(`   key_pts.length  `, factory.key_pts.length)
  console.log(`   key_pts  `, factory.key_pts)
  console.log('     ***    Next!')
  console.log('')
}

const saveTargetData = (factory, way_pt_idx, all_pt_idx, meter_count, is_good) => {
  if (factory.target_calcs[way_pt_idx]) {
    factory.target_calcs[way_pt_idx].est_idx = all_pt_idx;
    factory.target_calcs[way_pt_idx].est_meters = meter_count;
    factory.target_calcs[way_pt_idx].est_miles = Math.round(meter_count / 1609.34);
    if (is_good) {
      factory.target_calcs[way_pt_idx].isGood = true;
    }
  }
}

const saveKeyPoints = (factory) => {
  for (let i = 0; i < factory.way_pts_indexes.length; i++) {
    factory.key_pts.push({
      all_pt_idx: factory.way_pts_indexes[i],
      meters: factory.meter_counts[factory.way_pts_indexes[i]]
    })
  }
}

const cleanKeyPoints = (factory) => {
  let diff;
  factory.key_pts = factory.key_pts.sort((a, b) => {
    diff = 0;
    if (a.all_pt_idx > b.all_pt_idx) {
      diff = 1;
    } else if (a.all_pt_idx < b.all_pt_idx) {
      diff = -1;
    }
    return diff;
  });
  // remove duplicates:
  factory.key_pts = factory.key_pts.filter((pt_1, i, arr) => arr.findIndex(pt_2 => (pt_2.all_pt_idx === pt_1.all_pt_idx)) === i)
}

const checkWayPoints = (factory) => {
  let { target_calcs } = factory;
  for (let i = 0; i < target_calcs.length; i++) {
    // check formerly bad ones to see if they are acceptable
    if (!target_calcs[i].isGood) {
      // check if key_pt (known location) is close enough to target location
      // 2 mi = 3218 meters
      // 3 mi = 4828 meters
      if (Math.abs(target_calcs[i].est_meters - target_calcs[i].target_meters) < 3218) {
        target_calcs[i].isGood = true;
      }
    }
  }
}

const replaceFixedWayPoints = (factory) => { // why are both logged versions the same?
  // final results are not corrected :(
  // console.log('way_points.length - before replace', factory.way_points.length);
  // console.log('way_points - before replace', factory.way_points);
  console.log('way_pts_indexes - before replace', factory.way_pts_indexes);
  for (let i = 0; i < factory.target_calcs.length; i++) {
    if (factory.target_calcs[i].isGood) {
      // console.log('this is current way_point ', factory.way_points[i]);
      // console.log('replace w/ this way_point ', factory.all_points[factory.target_calcs[i].est_idx]);
      factory.way_points.splice(i, 1, factory.all_points[factory.target_calcs[i].est_idx]);
      // console.log('did it work? ', factory.way_points[i]);
      // console.log(`this is current idx - `, factory.way_pts_indexes[i])
      // console.log('replace w/ this idx - ', factory.target_calcs[i].est_idx);
      factory.way_pts_indexes.splice(i, 1, factory.target_calcs[i].est_idx);
      // console.log('did it work? ', factory.way_pts_indexes[i]);
    }
  }
  // console.log('way_points - after replace', factory.way_points);
  console.log('way_pts_indexes - after replace', factory.way_pts_indexes);
}

const selectFinalWayPoints = (factory) => {
  console.log('    ');
  console.log('   *** select in final way_points - use in 2nd multi-stop call to google api')

  let target, min_meters, max_meters, closer_pt, min_idx, max_idx, gap_size, distance, running_total, step;
  let { key_pts, target_calcs } = factory;
  savePreviousWaypoints(factory)
  // for each target/way_point
  for (let i = 0; i < target_calcs.length; i++) {
    // if this target has acceptable way point:
    if (target_calcs[i].isGood) {

    } else {    // for target that doesn't have acceptable way point:
      target = target_calcs[i].target_meters
      // for missed target, find neighboring key_pts: [k] and [k-1]
      for (let k = 0; k < key_pts.length; k++) {
        if (!target_calcs[i].isGood) {
          if (key_pts[k].meters > target) {
            min_meters = key_pts[k - 1].meters;
            max_meters = key_pts[k].meters;
            min_idx = key_pts[k - 1].all_pt_idx;
            max_idx = key_pts[k].all_pt_idx;
            // find closest one
            if (Math.abs(target - max_meters) <= Math.abs(target - min_meters)) {
              closer_pt = key_pts[k];
            }
            else {
              closer_pt = key_pts[k - 1];
            }
            // check if selected key_pt is close enough, or if there are no other candidates
            if (Math.abs(Math.abs(closer_pt.meters - target)) < 3218 || max_idx - min_idx === 1) {
              saveTargetData(factory, i, closer_pt.all_pt_idx, closer_pt.meters, true);
              break;
            }
            else {  // start w/ previous key_pt that doesn't exceed target
              // check each step to find best guess for closest idx
              gap_size = max_idx - min_idx;
              distance = max_meters - min_meters;
              step = distance / gap_size;
              running_total = key_pts[k - 1].meters;
              for (let step_count = 0; step_count <= gap_size; step_count++) {
                if (!target_calcs[i].isGood) {
                  // walk through steps until past the target
                  if (running_total > target) { // if step exceeds target
                    if (Math.abs(running_total - target) <=
                      Math.abs((running_total - step) - target)) { // if current step/all_pt is winner
                      saveTargetData(factory, i, min_idx + step_count, running_total, true);
                      break;
                    }
                    else {  // previous step/all_pt is winner
                      saveTargetData(factory, i, min_idx + (step_count - 1), running_total - step, true);
                      break;
                    }
                  } else {
                    running_total += step;
                  }
                }
              } // end steps loop
            }
          }
        }
      } // end key_pts loop for this target
    }
  } // end target_calcs loop
  replaceFixedWayPoints(factory);
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
  //            (get total_units from track_units_per_leg)
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
  console.log('        *')
  console.log('   *** select new way_points - use in 1st multi-stop call to google api')
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
      console.log(` all_pt ${x}  value ${meter_counts[x]}  target ${target_meters} - 1st one`);
      factory.way_points.push(all_points[x]);
      factory.way_pts_indexes.push(x);
      saveTargetData(factory, factory.way_points.length - 1, x, meter_counts[x])
      target_idx++;
      target_meters = targets[target_idx];
      count_to_next_hit = 0;
    }
    // if last target or last meter_count
    else if (target_idx === targets.length - 1 || x === meter_counts.length - 1) { // for last one, we already know what the end point is
      console.log(` all_pt ${all_points.length - 1}  value ${meter_counts[all_points.length - 1]}  target ${target_meters} - last one`);
      factory.way_points.push(all_points[all_points.length - 1]);
      factory.way_pts_indexes.push(all_points.length - 1);
      saveTargetData(factory, factory.way_points.length - 1, all_points.length - 1, meter_counts[all_points.length - 1])
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
        console.log(` all_pt ${x}  value ${meter_counts[x]}  target ${target_meters}`);
        factory.way_points.push(all_points[x]);
        factory.way_pts_indexes.push(x);
        saveTargetData(factory, factory.way_points.length - 1, x, meter_counts[x])
        target_idx++;
        target_meters = targets[target_idx];
        count_to_next_hit++;
        factory.track_units_per_leg.push(count_to_next_hit);
        count_to_next_hit = 0;
      }
      else { // previous one is closer
        console.log(` all_pt ${x - 1}  value ${meter_counts[x - 1]}  target ${target_meters}`);
        factory.way_points.push(all_points[x - 1]);
        factory.way_pts_indexes.push(x - 1);
        saveTargetData(factory, factory.way_points.length - 1, x - 1, meter_counts[x])
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
  console.log('        *')
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
      getLegDistances(incoming.data.routes[0], req.factory.leg_distances); // 1st leg distances as expected
      // make tentative estimate of meter count at each all_points
      getMeterCounts(req.factory)
      saveKeyPoints(req.factory)
      // select new waypoints based on first geo data
      selectNewWayPoints(req.factory)
      showRevisedData(req.factory)  // revisions seem fine
      setUrlWithWayPoints(req.factory) // url seems fine
      return getRouteData(req.factory.trip_url)
        .then(incoming => {
          getLegDistances(incoming.data.routes[0], req.factory.leg_distances); // 2nd leg distances are better
          checkWayPoints(req.factory) // update target_calcs with way points are now good
          saveKeyPoints(req.factory)
          cleanKeyPoints(req.factory);
          // select final waypoints based on accumulated geo data
          selectFinalWayPoints(req.factory);
          showRevisedData(req.factory) // data is not revised
          setUrlWithWayPoints(req.factory) // url has same waypoints as before
          return getRouteData(req.factory.trip_url)
            .then(incoming => {
              getLegDistances(incoming.data.routes[0], req.factory.leg_distances);  // 3rd leg distances not better
              // save final route details
              overview.summary = incoming.data.routes[0].summary;
              overview.bounds = incoming.data.routes[0].bounds;
              overview.total_meters = req.factory.total_meters;
              overview.total_mi = Math.round(overview.total_meters / 1609.34);
              overview.legs_per_day = req.factory.legs_per_day;
              req.factory.legs = incoming.data.routes[0].legs;
              return req;
            })
        })
    })
}

module.exports = {
  fixWayPoints,
  getExtraWayPoints
}
