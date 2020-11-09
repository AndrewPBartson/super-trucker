const axios = require('axios');

// function sendWeatherRequest(req, res, next) {
//   let lat = 40.401638;
//   let lng = -111.850373;

//   let url_weather = 'https://api.weather.gov/points/' + lat + ',' + lng + '/forecast';
// let url_weather = 'https://api.weather.gov/points/' + lat + ',' + lng + '/forecast';

//   return axios.get(url_weather)
//     .then(response => {
//       if (!response.data || response.data.status === "NOT_FOUND") {
//         console.log(`search term(s) not found :(`);
//         return;  // What is supposed to happen when this returns?
//       }
//       console.log('response.data :>> ', response.data);
//       return req;
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }

let getPointData = function(url) {
  console.log('enter getPointData()');
  return axios.get(url);
  }
  let getAllPointData = function() {
    console.log('enter getAllPointData()'); 
    // 35.41199,-99.4042228
    // 35.2665072,-102.5444808
    // 35.0695266,-104.2121425
    let promisesArray = [ 
      getPointData('https://api.weather.gov/points/35.4119,-99.4042/forecast'), 
      getPointData('https://api.weather.gov/points/35.2665072,-102.544808/forecast'), 
      getPointData('https://api.weather.gov/points/35.0695266,-104.2121425/forecast')
    ];
    return Promise.all(promisesArray);
  }

function getAllWeatherData (req, res, next) {
  console.log('*****   weather.getAllWeatherData() working!');
  // let lat;
  // let lng;
  // let url_weather;
  // let weather_urls = [ ];
  // for (let i = 0; i < req.payload.data.trip.time_points.length; i++) {
  //   url_weather = 
  //     'https://api.weather.gov/points/' 
  //     + req.payload.data.trip.time_points[i].latLng.lat + ',' 
  //     + req.payload.data.trip.time_points[i].latLng.lng   
  //     + '/forecast';
  //   weather_urls.push(url_weather);
  //   console.log('url_weather :>> ', url_weather);
  // }


  // getAllPointData()
  // .then(function (data) {
  //   //console.log('data.length :>> ', data.length);
  //   return req;
  // })
  // .catch(val => {
  //   console.log("rejected: " + val);
  // })


  // weather_urls.forEach(currentUrl => {
  //   return function(currentUrl) {
  //     axios.get(currentUrl);
  //   }
  // });

  // const fetchURL = (url) => axios.get(url);
  // const promiseArray = weather_urls.map(fetchURL);
  // console.log('1)  promiseArray :>> ', promiseArray);

  // Promise.all(promiseArray)
  // .then(data => { 
  //   console.log('data :>> ', data);
  //   return req;
    // console.log(' 2) promiseArray :>> ', promiseArray);
    // req.payload.data.trip.test = data;
    // for (let i = 0; i < data.length; i++) {
    //   console.log('data[i].data.properties.periods[i].detailedForecast :>> ', data[i].data.properties.periods[i].detailedForecast);
    //   req.payload.data.trip.weather_sets.push(data[i].data.properties);
    //}  
    // console.log(' req.payload.data.trip.weather_sets[0]:>> ', req.payload.data.trip.weather_sets[0]); 
    // return new Promise(function(resolve, reject) {
    //   resolve(req);
    // })
 
  
  // .then(req => {
  //   return new Promise(resolve => {
  //     resolve(req);
  // })
  // })
  // return req;
  // return Promise.all(promiseArray)
  // .then((data) => {
    // for (let i = 0; i < data.length; i++) {
    //   console.log('data[i].data.properties.periods[i].detailedForecast :>> ', data[i].data.properties.periods[i].detailedForecast);
    //   req.payload.data.trip.weather_sets.push(data[i].data.properties);
    // }
  // })
  // .catch((err) => {
  // });
  return req;
}

module.exports = {
  getAllWeatherData
}


// return new Promise(function(resolve, reject) {
//   resolve(getAllWeatherData(req, res, next));
// })