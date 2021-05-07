const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../../config/keys');
// load User schema
const User = require('../../models/User');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route    POST api/users/register
// @desc     Register user
// @access   Public
router.post('/register', (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        // if user found, set status to 400 bad input
        // (otherwise status defaults to 200 ok)
        // and tell why input was bad
        return res.status(400).json({
          email: 'Email already exists'
        })
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // 200 x 200
          r: 'pg', // rating
          d: 'mm' // if no gravatar for user, send dummy img
        });
        // map input to User model/schema (mongoose)
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar
        })
        // tell bcrypt to generate a salt and run 10 cycles
        bcrypt.genSalt(10, (err, salt) => {
          // when salt comes back, give password + salt to hash()
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            // if error, crash the app
            if (err) throw err;
            // save the hash as user's password (going to db)
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
    .catch(err => console.log(err))
})

// @route    POST api/users/login
// @desc     Login user / return JWT token
// @access   Public
router.post('/login', (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: 'User not found' })
      } else {
        bcrypt.compare(req.body.password, user.password)
          .then(isMatch => {
            if (isMatch) {
              const payload = {
                // user.id is alias for _id in mongodb
                // underscore indicates _id was the system variable
                // generated by database
                id: user.id,
                name: user.name,
                avatar: user.avatar
              }
              // sign jwt
              jwt.sign(payload,
                keys.secretOrKey,
                { expiresIn: 3600 }, // 3600 sec = 1 hour
                (err, token) => {
                  return res.json({ token: 'Bearer ' + token })
                })
            } else {
              return res.status(400).json({ password: 'Invalid password' });
            }
          })
      }
    })
})

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // passport added user data to req behind th scenes
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
)

function isValidUserInput(user) {
  if (user.name && user.superPower) {
    console.log('validating user.name and user.superPower');
    return true;
  }
  else {
    return false;
  }
}

function getAllUsersController(req, res, next) {
  model.users.getAllUsers()
    .then((result) => {
      res.status(200).json(result);
    })
};
function getUserByIdController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else {
    model.users.getUserById(req.params.id)
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

function createUserController(req, res, next) {
  // res.send(`Hello from Earth: Be Happy`)
  console.log('createUserController() - req.body :', req.body);
  if (isValidUserInput(req.body)) {
    // console.log('req.body :>> ', req.body);
    console.log('user is valid, proceed');
    // // save to db
    // model.users.createUser(req.body)
    //   .then(users => {
    res.status(201)//.json(users[0]);
    res.send('ok, black lives matter!')
    //   })
  }
  else {
    next({ message: 'Invalid or missing input to create new user' });
  }
}

function updateUserController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else if (!isValidUserInput(req.body)) {
    return next({ message: 'Invalid or missing input' });
  }
  else {
    model.users.updateUser(req.params.id, req.body)
      .then(users => {
        res.status(200).json(users[0])
      })
  }
}

function deleteUserController(req, res, next) {
  if (isNaN(req.params.id)) {
    return next({ message: 'Invalid ID, not a number' });
  }
  else {
    model.users.deleteUser(req.params.id)
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
