let knex = require('../db');

function getAllUsers() {
  return knex('users');
}

function getUserById(id) {
  return knex('users')
    .where('id', id)
    .first();
}

function createUser(user) {
  return knex('users')
    .insert(user, '*');
  // '*' returns all properties of the user
  // that just got created
}

function updateUser(id, user) {
  return knex('users')
    .where('id', id)
    .update(user, '*');
}

function deleteUser(id) {
  return knex('users')
    .del()
    .where('id', id)
    .then()
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}