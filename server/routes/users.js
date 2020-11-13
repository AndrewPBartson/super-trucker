const express = require('express')
const router = express.Router()
const userControllers = require('../user_controllers')

router.route('/users')
  .get(userControllers.users.getAllUsersController)
  .post(userControllers.users.createUserController)

router.route('/users/:id')
  .get(userControllers.users.getUserByIdController)
  .patch(userControllers.users.updateUserController)
  .put(userControllers.users.updateUserController)
  .delete(userControllers.users.deleteUserController)

router.route('/register')
  .post(userControllers.users.register)  

router.route('/login')
  .post(userControllers.users.login)  

module.exports = router