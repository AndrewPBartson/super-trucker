let model = require('../models');
let { build_trip } = require('./trip_builder');

function getAllTripsController(req, res, next) {
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
        if(result) {
          res.status(200).json(result);
        }
        else {
          res.status(404);
          next({ message: 'ID not found' });
        }
      })
    }
}

function createTripController(req, res, next) {
  console.log('createTripController - req.body :', req.body);
  build_trip(req, res, next);
      // save trip to db
      //   model.trips.createTrip(req.body)
      //   .then(trips => {
      //   res.status(201).json(trips[0]);
      // })   
        // .catch(function(error) {
        //   console.log(error);
        // });
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
      if(result) {
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
  getAllTripsController,
  getTripByIdController,
  createTripController,
  updateTripController,
  deleteTripController
}