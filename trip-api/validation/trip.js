const Validator = require('validator');

const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);

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

  if (isEmpty(data.timezone_city)) {
    errors.timezone_city = "Home Time Zone string is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };

}
