const Trip = require('../models/Trip');
let { build_trip } = require('./trip_builder');


function randomStr(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getAllTrips(req, res, next) {
  model.trips.getAllTrips()
    .then((result) => {
      res.status(200).json(result);
    })
}

function getTripByIdController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else {
    model.trips.getTripById(req.params.id)
      .then((result) => {
        if (result) {
          res.status(200).json(result);
        }
        else {
          res.status(404);
          next({ message: 'ID not found' });
        }
      })
  }
}

function createTrip(req, res, next) {
  build_trip(req, res, next)
    .then(req => {
      res.json(req.payload);
    })
    .catch(function (error) {
      console.log(error);
    })
  // .finally(req => {
  //   const newTrip = new Trip({
  //     name: req.body.name ? req.body.name : randomStr(4),
  //     notes: req.body.notes,
  //     origin: req.body.origin,
  //     end_point: req.body.end_point,
  //     hrs_driving: req.body.hrs_driving,
  //     avg_speed: req.body.avg_speed,
  //     miles_per_day: req.body.miles_per_day
  //   })
  //   newTrip.save()
  // })
}

function updateTripController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else if (!handleInputData(req.body)) {
    return next({ message: 'Invalid or missing input' });
  }
  else {
    model.trips.updateTrip(req.params.id, req.body)
      .then(trips => {
        res.status(200).json(trips[0])
      })
  }
}

function deleteTripController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else {
    model.trips.deleteTrip(req.params.id)
      .then((result) => {
        if (result) {
          res.status(200).json({ result });
        }
        else {
          res.status(404);
          next({ message: 'ID not found' });
        }
      })
  }
}

module.exports = {
  getAllTrips,
  getTripByIdController,
  createTrip,
  updateTripController,
  deleteTripController
}




// console.log('object :>> ', object);
// https://api.weather.gov/points/38.6860,-101.9331/forecast
// https://api.weather.gov/points/35.0695,-104.2121/forecast