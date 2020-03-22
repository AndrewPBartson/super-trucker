let model = require('../models');

function isValidUserInput(user) {
  return true;
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
console.log(req.body)
  if(isValidUserInput(req.body)) {
    // save to db
    model.users.createUser(req.body)
      .then(users => {
        res.status(201).json(users[0]);
      })
  }
   else {
     next({ message: 'Invalid or missing input' });
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
