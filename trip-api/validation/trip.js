const Validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateTripInput(data) {
  let errors = {};

  if (isEmpty(data.origin)) {
    errors.origin = "Starting Point field is required";
  }

  if (isEmpty(data.end_point)) {
    errors.end_point = "Destination field is required";
  }

  if (isEmpty(data.miles_per_day)) {
    errors.miles_per_day = "Miles Per Day field is required";
  }

  if (isEmpty(data.avg_speed)) {
    errors.avg_speed = "Average Speed field is required";
  }

  if (isEmpty(data.timezone_user)) {
    errors.timezone_user = "User Timezone string is required";
  }

  if (isEmpty(data.time_user_str)) {
    errors.time_user_str = "User Time string is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };

}
