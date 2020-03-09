const { setupDataStructure, isValidTripInput } = require('./input')
const { getInitialTripData } = require('./first_version')
const { recalculateWayPoints, getExtraWayPoints } = require('./waypoints')
const { searchForServicesSet } = require('./services')

function viewFinalData(trip) {
  console.log(`
      ********************** Reality Checks ****************
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

function createTestUrl(trip) {
  // creates a normal url (not to API) for checking waypoints
  let { way_points } = trip
  trip.test_url = `https://www.google.com/maps/dir/`
  for (let i = 0; i < trip.way_points.length; i++) {
    trip.test_url += trip.way_points[i];
    trip.test_url += '/';
  }
  trip.test_url += `&key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  trip.exports.test_url = trip.test_url
  return trip
}

function finalizeResponseData(req) {
  req.trip.exports.way_points = req.trip.way_points;
  req.trip.exports.way_points_set = req.trip.way_points_set;
  req.trip.exports.response = req.trip.response;
}

function build_trip(req, res, next) {
  console.log(`
              *** in trip_builder.build_trip() ***`)
  if (!isValidTripInput(req)) {
    next({ message: 'Invalid or missing input' });
  }
  setupDataStructure(req, res, next)
  return getInitialTripData(req, res, next)
    .then(req => {
      return recalculateWayPoints(req, res, next)
        .then(req => {
          console.log('   *************  waypoints finished *************')
          // to search for services, get extra nearby way points
          if (Object.keys(req.trip.services).length !== 0) {
            getExtraWayPoints(req, res, next)
          }
          viewFinalData(req.trip)
          // createTestUrl(req.trip)
          searchForServicesSet(req)
            .then(req => {
              finalizeResponseData(req);
              console.log('req.trip.exports :', req.trip.exports);
              res.json(req.trip.exports)
            })

        })
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = {
  build_trip
}