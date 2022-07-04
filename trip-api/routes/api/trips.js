const express = require('express');
const router = express.Router();
const validateTripInput = require('../../validation/trip');
let { build_trip } = require('../../trip_factory/trip_builder');

// @route   POST api/trips
// @desc    Create trip
// @access  Public
router.post('/', (req, res, next) => {
  const { errors, isValid } = validateTripInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  console.log(`req.body -> `, req.body);
  build_trip(req, res, next)
    .then(req => {
      res.json(req.payload.data);
    })
    .catch(err => console.log(err))
})

module.exports = router;
