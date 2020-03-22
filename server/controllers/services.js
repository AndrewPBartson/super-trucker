function createPlacesUrl(points) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=` +
  + points[0] + ',' + points[1] + `&radius=7000&type=lodging&key=AIzaSyDZSeVvDKJQFTgtYkjzOe368PIDbaq6OQE`
//  console.log("url -  ", url)
 return url
}

function searchForServices(trip, item) {
  // makes too many calls, google will start charging...
  //console.log('searchForServices()   ==============> - ', item.points)
  let info_url = createPlacesUrl(item.points)
  item.places = []
  return axios.get(info_url)
    .then(response => {
      if(response.data.results[0]) {
        //console.log('============>>>>>> here comes - ', response.data.results[0])
        // builds the places object
        // basic version, just gives the top item in search results
        // could filter results based on user input 
        for(let j = 0; j < response.data.results.length; j++) {
          let temp_result = {}
          temp_result.name = response.data.results[j].name
          temp_result.vicinity = response.data.results[j].vicinity
        
          if (response.data.results[j].photos) {
            temp_result.photos = [];
            temp_result.photos.push(response.data.results[j].photos[0].photo_reference)
          }
          temp_result.rating = response.data.results[j].rating
          //console.log('++++++++++++++++++++  temp_result - ', temp_result)
          item.places.push(temp_result)
        }
        return trip
      } 
    })
    .catch(function(error) {
      console.log(error);
    });
}

function searchForServicesSet(req, res, next) {
  // comment out for now, too many hits on Google Places
  let count = 0;
  let promises = [];
  // iterate each way point set, which consists of stopping point plus 2 nearby ones
  // many unnecessary calls here because not using results for prev and next :(
  // for (let i = 1; i < trip.exports.way_points_set.length; i++) { 
  //   // do three searches for way_points_set, one for each of the three
  //   promises.push(searchForServices(trip, trip.exports.way_points_set[i].stop))
  //   if (trip.exports.way_points_set[i].prev.points) {
  //     promises.push(searchForServices(trip, trip.exports.way_points_set[i].prev))
  //   }
  //   if (trip.exports.way_points_set[i].next.points) {
  //     promises.push(searchForServices(trip, trip.exports.way_points_set[i].next))
  //   }
  // }
  return Promise.all(promises)
  .then(results => { 
    return req
  })
  .catch(function(error) {
    console.log(error);
  });
}

module.exports = {
  searchForServicesSet
}

// example of correct url for google places API:
// https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=CnRtAAAATLZNl354RwP_9UKbQ_5Psy40texXePv4oAlgP4qNEkdIrkyse7rPXYGd9D_Uj1rVsQdWT4oRz4QrYAJNpFX7rzqqMlZw2h2E2y5IKMUZ7ouD_SlcHxYq1yL4KbKUv3qtWgTK0A6QbGh87GB3sscrHRIQiG2RrmU_jF4tENr9wGS_YxoUSSDrYjWmrNfeEHSGSc3FyhNLlBU&key=AIzaSyDZSeVvDKJQFTgtYkjzOe368PIDbaq6OQE