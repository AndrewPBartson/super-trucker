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

// convert 'seconds' (from google maps api) to text 
function secondsToHoursStr(seconds) {
  let num_hours = Math.floor(seconds / 60 / 60);
  let hours_text = num_hours === 1 ? ' hour ' : ' hours ';
  let num_minutes = Math.round((seconds / 60) % 60);
  return num_hours + hours_text + num_minutes + ' min';
}

// for reference, not using
function formatTimeOld(timeStamp) {
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

// required format for 'timezone' argument: 'GMT-07:00'
function getTimeForTimezone(timestamp, timezone) {
  // example output - Sat, Jul 24, 10:31 AM
  if (!timezone) {
    timezone = 'GMT-07:00';
  }
  let timeStr = '';
  if (timestamp && timezone) {
    let offsetStr = timezone.replace(/:/g, '');
    let reverseOffset = offsetStr.replace(/[-+]/, sign => sign === '+' ? '-' : '+');
    let time = new Date(timestamp);
    timeStr = time.toUTCString().replace('GMT', reverseOffset);

    time = new Date(Date.parse(timeStr));
    timeStr = time.toLocaleString('en-US', {
      timeZone: 'UTC', // Don't change from UTC
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      // year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      // second: '2-digit'
    })
  }
  return timeStr;
}

// consider making this DRY: return obj with 2 properties
// trade off - then relevant property must be extracted from obj
function getOtherTimeForTimezone(timestamp, timezone) {
  // example output - Sat, 07/24, 10:31 AM
  if (!timezone) {
    timezone = 'GMT-07:00';
  }
  let timeStr = '';
  if (timestamp && timezone) {
    let offsetStr = timezone.replace(/:/g, '');
    let reverseOffset = offsetStr.replace(/[-+]/, sign => sign === '+' ? '-' : '+');
    let time = new Date(timestamp);
    timeStr = time.toUTCString().replace('GMT', reverseOffset);

    time = new Date(Date.parse(timeStr));
    timeStr = time.toLocaleString('en-US', {
      timeZone: 'UTC', // Don't change from UTC
      weekday: 'short',
      month: '2-digit',
      day: 'numeric',
      // year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      // second: '2-digit'
    })
  }
  return timeStr;
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

const getTimestampFromStr = (str, timezone) => {
  // example input (obtained from NOAA 7 Day Forecast html) - 
  // 11am CDT Jul 24, 2021-6pm CDT Jul 30, 2021 
  const months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
  }
  str = str.split(' ');
  let day = str[3].slice(0, 2)
  let month = months[str[2]];
  let year = str[4].slice(0, 4);
  let tz_trimmed = timezone.slice(3);
  let date_str = year + '-' + month + '-' + day + 'T00:00:00' + tz_trimmed;
  return Date.parse(date_str);;
}

const capitalize1stChar = (str) => {
  return str.split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

module.exports = {
  secondsToHoursStr,
  getTimeForTimezone,
  getOtherTimeForTimezone,
  formatTime,
  formatDateLong,
  formatDateShort,
  getTimestampFromStr,
  capitalize1stChar
}
