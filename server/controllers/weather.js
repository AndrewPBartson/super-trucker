

function getWeatherForecasts(req, res, next) {
  console.log('req.trip.weather :', req.trip.weather);
  if (req.trip.weather) {
  console.log('************** weather.getWeatherForecasts() ***************');
  }
  return req
}

module.exports = {
  getWeatherForecasts
}