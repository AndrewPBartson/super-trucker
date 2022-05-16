const moment = require('moment-timezone');

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

function formatTimeOld(timeStamp) {
  // for reference, not using
  let dateTime = new Date(Math.round(timeStamp))
  let month = dateTime.getMonth() + 1; // getMonth is zero-based index
  let date = dateTime.getDate();
  let hour = dateTime.getHours();
  let minutes = dateTime.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = '0' + minutes;
  }
  let time_text = `${hour}:${minutes}`;
  let date_text = `${month}/${date}`;
  console.log('month :>> ', month);
  console.log('date :>> ', date);
  console.log('hour :>> ', hour);
  console.log('minutes :>> ', minutes);
  console.log('time_text :>> ', time_text);
  console.log('date_text :>> ', date_text);
  // return time_text;
  return date_text;
}

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

const convertToTimezone = (timestamp, timezone = 'GMT-07:00') => {
  // consider using moment.js to simplify timezone calcs
  let timeStr = '';
  let offsetStr = timezone.replace(/:/g, '');
  let reverseOffset = offsetStr.replace(/[-+]/, sign => sign === '+' ? '-' : '+');
  // the following time is assigned local (server) timezone
  let time = new Date(timestamp);
  timeStr = time.toUTCString().replace('GMT', reverseOffset);

  time = new Date(Date.parse(timeStr));
  return time;
}

const formatTimesForTimezone = (timestamp, timezone = 'GMT-07:00') => {
  if (timestamp) {
    let time = convertToTimezone(timestamp, timezone);

    let timeMultiFormat = {
      timeStrLong: '',
      timeStrShort: ''
    };
    timeMultiFormat.timeLong = time.toLocaleString('en-US', {
      // result - Sat, Jul 24, 10: 31 AM
      timeZone: 'UTC', // Don't change from UTC
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      // year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    // alternate format for month - 2-digit e.g. 6/17
    timeMultiFormat.timeShort = time.toLocaleString('en-US', {
      // result - Sat, 07/24, 10:31 AM
      timeZone: 'UTC', // Don't change from UTC
      weekday: 'short',
      month: '2-digit',
      day: 'numeric',
      // year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    return timeMultiFormat;
  }
}

const formatTime = (dateTime) => {
  // example input - Sun, Jul 18, 04:06 PM
  // example output - 4:06 PM
  let timeStr = dateTime.slice(dateTime.length - 8);
  if (timeStr[0] === '0') {
    timeStr = timeStr.slice(1)
  }
  return timeStr;
}

const formatDateLong = (dateTime) => {
  // example output - Fri, Jul 23
  let dateStr = dateTime.slice(0, dateTime.length - 10);
  return dateStr;
}

const formatDateShort = (dateTime) => {
  // example output - 7/23
  let dateStr = dateTime.slice(5, dateTime.length - 10);
  if (dateStr[0] === '0') {
    dateStr = dateStr.slice(1);
  }
  return dateStr;
}

const calcMidnight = (input_time, timezone) => {
  // console.log('input_time (msec) :>> ', input_time); // ok
  let midnight;
  let timeObj = new Date(input_time);
  // console.log('timeObj :>> ', timeObj);       // 2022-04-28T20:45:10.984Z
  let newTimeObj = convertToTimezone(timeObj, timezone);
  // console.log('newTimeObj :>> ', newTimeObj); // 2022-04-28T12:45:10.000Z
  newTimeObj.setHours(0);
  newTimeObj.setMinutes(0);
  newTimeObj.setSeconds(0);
  newTimeObj.setMilliseconds(0);
  midnight = newTimeObj.getTime();

  console.log('midnight (msec) :>> ', midnight);
  return midnight;
}

module.exports = {
  secondsToHoursStr,
  convertToTimezone,
  formatTimesForTimezone,
  formatTime,
  formatDateLong,
  formatDateShort,
  capitalize1stChar,
  calcMidnight
}
