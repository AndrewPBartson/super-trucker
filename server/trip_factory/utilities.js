// convert 'seconds' (from google maps api) to text 
function secondsToTimeString(seconds) {
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

module.exports = {
  secondsToTimeString,
  getTimeForTimezone
}