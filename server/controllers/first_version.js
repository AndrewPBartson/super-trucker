const axios = require('axios')
const polyline = require('polyline')

function getInitialTripData(req, res, next) {
  let format_origin = req.trip.origin.split(" ").join("+")
  let format_end_point = req.trip.end_point.split(" ").join("+");
  let trip_url = `https://maps.googleapis.com/maps/api/directions/json?origin=
    ${format_origin}&destination=${format_end_point}
    &key=AIzaSyAd0ZZdBnJftinI-qHnPoP9kq5Mtkey6Ac`
  return axios.get(trip_url)
    .then(response_1 => {
      console.log(`response_1.data.status : ${response_1.data.status}`);
      if (!response_1.data || response_1.data.status === "NOT_FOUND") {
        console.log(`response_1.data : ${response_1.data}
        search term(s) not found :(`);
        return;  // What is supposed to happen when this returns?
      }
      calcFirstWayPoints(req.trip, response_1)
      console.log(`********* 1st version of trip done, back to trip_builder() ***********
      `);
      return req;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function calcFirstWayPoints(trip, response_1) {
  // takes Gmaps trip summary polyline and converts it
  // to array of lat/lng coordinates
  trip.all_points = polyline.decode(response_1.data.routes[0].overview_polyline.points)
  // get total length of trip in meters and miles
  trip.total_meters = response_1.data.routes[0].legs[0].distance.value
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
  trip.way_points_indexes = [];
  for (let t = 0; t < trip.num_legs_round; t++) {
    // if last leg, push number of "leftover" segments in last leg of trip
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
    trip.way_points_indexes.push(count);
    count += trip.num_segments_in_leg_array[i]
  }
  // push destination
  trip.way_points.push(trip.all_points[trip.all_points.length - 1]) 
  trip.way_points_indexes.push(trip.all_points.length - 1);
  // now trip.way_points contains a first approximation of where stopping places should be
  console.log(`********* 1st version of trip in process -> trip : ${trip}`);
  return trip
}

module.exports = {
  getInitialTripData
}