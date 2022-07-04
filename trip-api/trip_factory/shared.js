function randomStr(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getType(elem) {
  if (Array.isArray(elem)) {
    return 'array';
  }
  if (elem instanceof Function) {
    return 'function';
  }
  else if (elem instanceof Object) {
    return 'object';
  }
  else if (typeof elem === 'string') {
    return 'string';
  }
  else if (typeof elem === 'number') {
    return 'number';
  }
  else if (typeof elem === 'boolean') {
    return 'boolean';
  }
  else if (elem === null) {
    return 'null';
  }
  else if (typeof elem === 'undefined') {
    return 'undefined';
  }
  else {
    return 'unknown type';
  }
}

const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);

const capitalize1stChar = (str) => {
  return str.split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

function secondsToHoursStr(seconds) {
  // input - seconds from google maps api
  // output example - '2 hours 45 min' 
  let num_hours = Math.floor(seconds / 60 / 60);
  let hours_text = num_hours === 1 ? ' hour ' : ' hours ';
  let num_minutes = Math.round((seconds / 60) % 60);
  return num_hours + hours_text + num_minutes + ' min';
}

module.exports = {
  capitalize1stChar,
  isEmpty,
  secondsToHoursStr
}


