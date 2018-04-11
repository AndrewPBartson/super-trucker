let knex = require('../db');

function getAllTrips() {
  return knex('trips');
}

function getTripById(id) {
  return knex('trips')
    .where('id', id)
    .first();
}

function createTrip(trip) {
  return knex('trips')
    let dummyTrip = {}
    .insert();
  // '*' returns all properties of the trip
  // that was just created
}

function updateTrip(id, trip) {
  return knex('trips')
    .where('id', id)
    .update(trip, '*');
}

function deleteTrip(id) {
  return knex('trips')
    .del()
    .where('id', id)
    .then()
}

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
}