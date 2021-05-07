const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trip = require('../../models/Trip');
let { build_trip } = require('../../trip_factory/trip_builder');


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
  build_trip(req, res, next)
    .then(req => {
      res.json(req.payload);
    })
    .catch(function (error) {
      console.log(error);
    })
})

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
