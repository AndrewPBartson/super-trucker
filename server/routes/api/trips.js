const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const validateTripInput = require('../../validation/trip');
// const Trip = require('../../models/Trip');
let { build_trip } = require('../../trip_factory/trip_builder');

function getAllTrips(req, res, next) {
  model.trips.getAllTrips()
    .then((result) => {
      res.status(200).json(result);
    })
}

// @route   POST api/trips/:id
// @desc    Get trip by id
// @access  Private (should be)
function getTripById(req, res, next) {
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

// @route   POST api/trips
// @desc    Create trip
// @access  Public
router.post('/', (req, res, next) => {
  const { errors, isValid } = validateTripInput(req.body);
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }
  // res.json(trip_I40);
  build_trip(req, res, next)
    .then(req => {
      //console.log('  =====   ========== req.factory :>> ', req.factory);
      res.json(req.payload);
    })
    .catch(function (error) {
      console.log(error);
    })
})

// @route   POST api/trips/save
// @desc    Save trip to db
// @access  Private

// const newTrip = new Trip({
//   name: req.body.name,
//   notes: req.body.notes,
//   origin: req.body.origin,
//   end_point: req.body.end_point,
//   hours_driving: req.body.hours_driving,
//   avg_speed: req.body.avg_speed,
//   miles_per_day: req.body.miles_per_day,
//   user: req.user.id
// });

// newPost.save().then(post => res.json(post));

function updateTrip(req, res, next) {
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

function deleteTrip(req, res, next) {
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

module.exports = router;
