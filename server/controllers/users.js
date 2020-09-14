let model = require('../models');

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
        if(result) {
          res.status(200).json(result);
        }
        else {
          res.status(404);
          next({ message: 'ID not found'  });
        }
      })
    }
}

function createUserController(req, res, next) {
  // res.send(`Hello from Earth: Be Happy`)
  console.log('createUserController() - req.body :', req.body);
  if(isValidUserInput(req.body)) {
    console.log('req.body :>> ', req.body);
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
    return next({message: 'Invalid or missing input'});
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
      if(result) {
        res.status(200).json({ result });
      }
      else {
        res.status(404);
        next({ message: 'ID not found' });
      }
    })
  }
}

module.exports = {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
}
