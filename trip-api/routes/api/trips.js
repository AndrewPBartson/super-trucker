const express = require('express');
const router = express.Router();

const validateTripInput = require('../../validation/trip');
// const Trip = require('../../models/Trip');
let { build_trip } = require('../../trip_factory/trip_builder');

// @route   POST api/trips
// @desc    Create trip
// @access  Public
// router.post('/', (req, res, next) => {
router.post('/api/trips', (req, res, next) => {
  const { errors, isValid } = validateTripInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  build_trip(req, res, next)
    .then(req => {
      res.json(req.payload);
    })
    .catch(err => console.log(err))
})

module.exports = router;
