const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.route('/trips')
  .get(controllers.trips.getAllTripsController)
  .post(controllers.trips.createTripController)

router.route('/trips/:id')
  .get(controllers.trips.getTripByIdController)
  .patch(controllers.trips.updateTripController)
  .put(controllers.trips.updateTripController)
  .delete(controllers.trips.deleteTripController)

module.exports = router