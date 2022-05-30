function reviewWaypointCalcs(factory) {
  console.log(`
      ===============  Trip Factory Report   ===============
      total_meters -  ${factory.total_meters}
      meters_per_day -  ${factory.meters_per_day}
      length of second leg -  ${factory.leg_distances[1]}
      total miles -  ${factory.total_meters / 1609.34}
      all_points.length -  ${factory.all_points.length}  
      meter_counts.length -  ${factory.meter_counts.length}
      num_units -  ${factory.num_units}
      way_points :
        ${factory.way_points}
      way_points.length -  ${factory.way_points.length}
      leg_distances.length -  ${factory.leg_distances.length}
      num_legs_float -  ${factory.num_legs_float}
      num_legs -  ${factory.num_legs}
      units_per_leg_float -  ${factory.units_per_leg_float}
      units_per_leg -  ${factory.units_per_leg}
      'leftover' units -  ${factory.leftovers}
      ${factory.units_per_leg}  *  ${factory.num_legs - 1}  +  ${factory.leftovers}  =  ${factory.num_units}
      ======================================================
   `)
  return factory;
}

function getTimeForTimezone(timestamp, timezone) {
  // input -'timezone' param: required format - 'GMT-07:00'
  let timeStr = '';
  // let timeStrMultiFormat = {
  //   timeStrLong: '',
  //   timeStrShort: ''
  // };
  if (!timezone) {
    timezone = 'GMT-07:00';
  }
  if (timestamp && timezone) {
    let offsetStr = timezone.replace(/:/g, '');
    let reverseOffset = offsetStr.replace(/[-+]/, sign => sign === '+' ? '-' : '+');
    // what timezone is the following Date supposed to be?
    let time = new Date(timestamp);
    timeStr = time.toUTCString().replace('GMT', reverseOffset);

    time = new Date(Date.parse(timeStr));
    timeStr = time.toLocaleString('en-US', {
      // example - Sat, Jul 24, 10: 31 AM
      timeZone: 'UTC', // Don't change from UTC
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      // year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      // second: '2-digit'
    })
    timeStr = time.toLocaleString('en-US', {
      // example - Sat, 07/24, 10:31 AM
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
  // return timeStrMultiFormat.timeStrLong;
  return timeStr;
}

function getOtherTimeForTimezone(timestamp, timezone) {
  // example output - Sat, 07/24, 10:31 AM
  let timeStr = '';
  if (!timezone) {
    timezone = 'GMT-07:00';
  }
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

const checkTimeStrings = (days, timezone) => {
  let user_ETA;
  console.log(`
  ===  Check total mi and hrs -`);
  for (let i = 0; i < days.length; i++) {
    console.log('Day ' + (i + 1));
    for (let j = 0; j < days[i].time_points.length; j++) {
      user_ETA = getOtherTimeForTimezone(days[i].time_points[j].timestamp, timezone);
      console.log('  ' + days[i].time_points[j].city_state);
      console.log('    start_24 -  '
        + getOtherTimeForTimezone(days[i].time_points[j].weather.forecast24hour.start_24, timezone));
      console.log('    ETA -       ' + user_ETA);
      console.log('    end_24 -    '
        + getOtherTimeForTimezone(days[i].time_points[j].weather.forecast24hour.end_24, timezone));
      if (days[i].time_points[j].weather.forecast12hour) {
        console.log(' ');
        console.log('                       start_12 -  '
          + getOtherTimeForTimezone(days[i].time_points[j].weather.forecast12hour.start_12, timezone));
        console.log('                       ETA -       ' + user_ETA);
        console.log('                       end_12 -    '
          + getOtherTimeForTimezone(days[i].time_points[j].weather.forecast12hour.end_12, timezone));
      }
    }
    console.log('        ');
  }
}

const checkDistanceDuration = (days, overview) => {
  let distance_total = 0;
  let duration_total = 0;
  console.log(`
  ===  Check total mi and hrs -`);
  for (let i = 0; i < days.length; i++) {
    console.log('Day ' + (i + 1));
    for (let j = 0; j < days[i].time_points.length; j++) {
      console.log('  ' + days[i].time_points[j].city_state);
      if (days[i].time_points[j].next_leg) {
        distance_total += days[i].time_points[j].next_leg.distance.meters;
        duration_total += days[i].time_points[j].next_leg.duration.msec;
        console.log('    miles calc - ' + days[i].time_points[j].next_leg.distance.meters / 1609.34);
        console.log('    miles text -       ' + days[i].time_points[j].next_leg.distance.text_mi);
        console.log('            ');
        console.log('    hours calc - ' + days[i].time_points[j].next_leg.duration.msec / 3600000);
        console.log('    hours text -       ' + days[i].time_points[j].next_leg.duration.text);
      }
      console.log('            ');
    }
    console.log('    Daily totals');
    console.log('      miles -       ', distance_total / 1609.34);
    console.log('      miles text -  ', days[i].totals.miles_today);
    console.log('      hours -       ', duration_total / 3600000);
    console.log('      hours text -  ', days[i].totals.hours_today);
  }
  console.log('            ');
  console.log('Trip totals');
  console.log('  miles -       ', distance_total / 1609.34);
  console.log('  miles text -  ', overview.total_mi_text);
  console.log('  hours -       ', duration_total / 3600000);
  console.log('  hours text -  ', overview.total_hrs_text);
  console.log('        ');
}

const checkDataSources = (days) => {
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < days[i].time_points.length; j++) {
      console.log('days[' + i + '].time_points[' + j +
        '].temperature :>> ' +
        days[i].time_points[j].weather.temperature);
    }
  }
}

const testWeatherDates = (days) => {
  let start_12, end_12, start_24, noon_24, end_24;
  for (let i = 0; i < days.length; i++) {
    console.log('Day ' + (i + 1));
    for (let j = 0; j < days[i].time_points.length; j++) {
      console.log('City : ', days[i].time_points[j].city_state);
      if (days[i].time_points[j].weather.forecast12hour) {
        start_12 = getTimeForTimezone(days[i].time_points[j].weather.forecast12hour.start_12, 'GMT-04:00');
        end_12 = getTimeForTimezone(days[i].time_points[j].weather.forecast12hour.end_12, 'GMT-04:00');
      }
      else { console.log(' - - - ') }
      start_24 = getTimeForTimezone(days[i].time_points[j].weather.forecast24hour.start_24, 'GMT-04:00');
      noon_24 = getTimeForTimezone(days[i].time_points[j].weather.forecast24hour.noon, 'GMT-04:00');
      end_24 = getTimeForTimezone(days[i].time_points[j].weather.forecast24hour.end_24, 'GMT-04:00');

      console.log('   start_12 : ' + start_12);
      console.log('     end_12 : ' + end_12);
      console.log('        start_24 : ' + start_24);
      console.log('         noon_24 : ' + noon_24);
      console.log('          end_24 : ' + end_24);
    }
  }
}

function timeTester(dateTime, time_Id) {
  //let dateTime = new Date(Math.round(timeStamp))
  let month = dateTime.getMonth() + 1; // getMonth is zero-based index
  let date = dateTime.getDate();
  let hour = dateTime.getHours();
  let minutes = dateTime.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = '0' + minutes;
  }
  let time_text = `${hour}:${minutes}`;
  let date_text = `${month}/${date}`;
  // console.log('month :>> ', month);
  // console.log('date :>> ', date);
  // console.log('hour :>> ', hour);
  // console.log('minutes :>> ', minutes);
  // console.log('time_text :>> ', time_text);
  // console.log('date_text :>> ', date_text);
  console.log(time_Id + ': ' + date_text + ' ' + time_text);
  // return time_text;
  return date_text;
}

const logTestString = (time_point) => {
  let testString = time_point.time_user + '  =>  '
    + time_point.status + '  =>  '
    + time_point.city_state;
  if (time_point.next_leg) {
    testString += '  =>  ' + time_point.next_leg.duration.text;
  }
  console.log(testString);
}

module.exports = {
  reviewWaypointCalcs,
  testWeatherDates,
  checkTimeStrings,
  checkDistanceDuration,
  checkDataSources
}