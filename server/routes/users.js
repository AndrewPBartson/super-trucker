const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.route('/users')
  .get(controllers.users.getAllUsersController)
  .post(controllers.users.createUserController)

router.route('/users/:id')
  .get(controllers.users.getUserByIdController)
  .patch(controllers.users.updateUserController)
  .put(controllers.users.updateUserController)
  .delete(controllers.users.deleteUserController)

router.route('/register')
  .post(controllers.users.register)

router.route('/login')
  .post(controllers.users.login)

module.exports = router