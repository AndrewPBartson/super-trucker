const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.route('/trips')
  .get(controllers.trips.getAllTrips)
  .post(controllers.trips.createTrip)

router.route('/trips/:id')
  .get(controllers.trips.getTripById)
  .patch(controllers.trips.updateTrip)
  .put(controllers.trips.updateTrip)
  .delete(controllers.trips.deleteTrip)

module.exports = router