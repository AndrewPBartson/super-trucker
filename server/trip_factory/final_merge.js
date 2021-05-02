function viewFactoryReport(factory) {
  console.log(`
      ******************** Trip Factory Report ****************
      total_meters -  ${factory.total_meters}
      meters_per_day -  ${factory.meters_per_day}
      length of second leg -  ${factory.leg_distances[1]}
      total miles -  ${factory.total_meters / 1609.34}
      all_points.length -  ${factory.all_points.length}  
      meter_counts.length -  ${factory.meter_counts.length}
      num_segments -  ${factory.num_segments}
      way_points :
        ${factory.way_points}
      way_points.length -  ${factory.way_points.length}
      leg_distances.length -  ${factory.leg_distances.length}
      num_legs -  ${factory.num_legs}
      num_legs_round -  ${factory.num_legs_round}
      segments_per_leg -  ${factory.segments_per_leg}
      segments_per_leg_round -  ${factory.segments_per_leg_round}
      'leftover' segments -  ${factory.leftovers}
      ${factory.segments_per_leg_round}  *  ${factory.num_legs_round - 1}  +  ${factory.leftovers}  =  ${factory.num_segments}
      ******************************************************
   `)
  return factory;
}

function formatTime(timeStamp) {
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
}

function getTimeForTimezone(ts, tz) {
  let offsetStr = tz.replace(/:/g, '');
  let reverseOffset = offsetStr.replace(/[-+]/, sign => sign === '+' ? '-' : '+');
  let time = new Date(ts);
  let timeStr = time.toUTCString().replace('GMT', reverseOffset);

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
  }) //+ ' ' + tz;
  return timeStr;
}

const nailPointTimeData = (req, res, next) => {
  // viewFactoryReport(req.factory);
  console.log('nailPointTimeData() is working');
  console.log('**test convert tz :>> ', getTimeForTimezone(new Date(1611864000000), 'GMT-07:00'))

  let { nodes, weather } = req.payload.data.trip;
  let tz_user = req.payload.data.trip.overview.timezone_id_user;
  let tz_local;
  let current_time;

  for (let k = 0; k < nodes.length; k++) {
    for (let x = 0; x < nodes[k].time_points.length; x++) {
      tz_local = nodes[k].timezone_id_local;
      // get timestamp of time_point
      let timestamp = nodes[k].time_points[x].timestamp;
      // create local time string with date and time am/pm
      // create home time string with date and time am/pm
      console.log('At this time => ', nodes[k].time_points[x].status);

      for (let j = 0; j < weather.length; j++) {
        for (let y = 0; y < weather[j].forecast12hour.length; y++) {
          // get NOAA data for this timestamp 
          if (timestamp >= weather[j].forecast12hour[y].start
            && timestamp < weather[j].forecast12hour[y].end) {
            nodes[k].time_points[x].weather.forecast12hour = weather[j].forecast12hour[y];
          }
        }
        for (let z = 0; z < weather[j].forecast24hour.length; z++) {
          // get OWM data for this timestamp 
          if (timestamp >= weather[j].forecast24hour[z].start
            && timestamp < weather[j].forecast24hour[z].end) {
            nodes[k].time_points[x].weather.forecast24hour = weather[j].forecast24hour[z];
            for (let a = 0; a < weather[j].forecast24hour[z].temps.length; a++) {
              // select temperature for this timestamp
              if (timestamp >= weather[j].forecast24hour[z].temps[a].start
                && timestamp < weather[j].forecast24hour[z].temps[a].end) {
                nodes[k].time_points[x].weather.temperature = weather[j].forecast24hour[z].temps[a].temp;
                nodes[k].time_points[x].weather.temp_time_check = weather[j].forecast24hour[z].temps[a].name;
              }
            }
          }
        }
      }
    }
  }
  return req;
}

module.exports = {
  nailPointTimeData
}


