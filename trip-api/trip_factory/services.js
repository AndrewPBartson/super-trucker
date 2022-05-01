const GMkey = process.env.gmKey;

function createPlacesUrl(points) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${points[0]},${points[1]}&radius=7000&type=lodging&key=${GMkey}`;
  return url
}

function searchForServices(trip, item) {
  // inactive - too many hits on Google Places
  let info_url = createPlacesUrl(item.points)
  item.places = []
  return axios.get(info_url)
    .then(response => {
      if (response.data.results[0]) {
        // builds the places object
        // basic version, just gives the top item in search results
        // could filter results based on rating or other user input 
        for (let j = 0; j < response.data.results.length; j++) {
          let temp_result = {}
          temp_result.name = response.data.results[j].name
          temp_result.vicinity = response.data.results[j].vicinity

          if (response.data.results[j].photos) {
            temp_result.photos = [];
            temp_result.photos.push(response.data.results[j].photos[0].photo_reference)
          }
          temp_result.rating = response.data.results[j].rating
          item.places.push(temp_result)
        }
        return trip
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function searchForServicesSet(req, res, next) {
  let count = 0;
  let promises = [];
  // commented out - too many hits on Google Places
  // implement when we have subscribers!
  // iterate each way point set which consists of stop point plus 2 nearby ones
  // for (let i = 1; i < trip.exports.way_points_extra.length; i++) { 
  //   // do three searches for way_points_extra, one for each of the three
  //   promises.push(searchForServices(trip, trip.exports.way_points_extra[i].stop))
  //   if (trip.exports.way_points_extra[i].prev.points) {
  //     promises.push(searchForServices(trip, trip.exports.way_points_extra[i].prev))
  //   }
  //   if (trip.exports.way_points_extra[i].next.points) {
  //     promises.push(searchForServices(trip, trip.exports.way_points_extra[i].next))
  //   }
  // }
  return Promise.all(promises)
    .then(results => {
      return req
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  searchForServicesSet
}
