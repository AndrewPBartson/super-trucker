const axios = require('axios')
const polyline = require('polyline')

function getInitialTripData(req, res, next) {
  let format_origin = req.trip.origin.split(" ").join("+")
  let format_end_point = req.trip.end_point.split(" ").join("+");
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${format_origin}&destination=${format_end_point}
    &key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return axios.get(trip_url)
    .then(response => {
      console.log('response.data.status :', response.data.status);
      if (!response.data || response.data.status === "NOT_FOUND") {
        console.log('response.data :', response.data);
        console.log('search term(s) not found :(');
        return;
      }
      calcFirstWayPoints(req.trip, response)
      console.log('****************** first-version of trip done ******************');
      return req;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function calcFirstWayPoints(trip, response) {
  // takes Gmaps trip summary polyline and converts it
  // to array of lat/lng coordinates
  trip.all_points = polyline.decode(response.data.routes[0].overview_polyline.points)
  // get total length of trip in meters and miles
  trip.total_meters = response.data.routes[0].legs[0].distance.value
  trip.total_mi = trip.total_meters / 1609.34
  // find out total number of points and segments -
  trip.num_segments = trip.all_points.length - 1
  // calculate number of driving periods (legs) to destination
  trip.num_legs = trip.total_mi / trip.miles_per_day
  // (later modify to get twice as many segments because must have midpoint for each leg)
  // determine number of segments that should be in each leg
  trip.segments_per_leg = trip.num_segments / trip.num_legs
  trip.segments_per_leg_round = Math.floor(trip.segments_per_leg);
  // convert num_legs to int for iteration purposes
  trip.num_legs_round = Math.ceil(trip.num_legs)
  // calculate number of 'leftover' segments in final driving period
  trip.leftovers = trip.num_segments - ((trip.num_legs_round - 1) * trip.segments_per_leg_round)
  trip.num_segments_in_leg_array = [];
  for (let t = 0; t < trip.num_legs_round; t++) {
    // if last leg, (what?)
    if (t === trip.num_legs_round - 1) {
      trip.num_segments_in_leg_array.push(trip.leftovers)
    }
    else {
      trip.num_segments_in_leg_array.push(trip.segments_per_leg_round)
    }
  }
  let count = 0;
  // gather way_points:
  // grab out a point that (somewhat) corresponds to end of each leg
  for (let i = 0; i <= trip.num_legs_round - 1; i++) {
    trip.way_points.push(trip.all_points[count]);
    count += trip.num_segments_in_leg_array[i]
  }
  trip.way_points.push(trip.all_points[trip.all_points.length - 1]) // push destination
  // now trip.way_points contains a first approximation of where stopping places should be
  console.log('trip after calcFirstWayPoints() :', trip);
  return trip
}

module.exports = {
  getInitialTripData
}