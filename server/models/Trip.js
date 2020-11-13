const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema
const TripSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  origin: {
    type: String
  },
  end_point: {
    type: String
  },
  hrs_driving: {
    type: Number
  },
  avg_speed: {
    type: Number
  },
  miles_per_day: {
    type: Number
  }
})

module.exports = Trip = mongoose.model('trips', TripSchema)
// in mongodb the collection will be called 'trips' but in the
// exports it's called 'Trip'