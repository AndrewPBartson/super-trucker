const createDataPoint = (time_pt) => {
  let data = {
    city_state: time_pt.city_state,
    date: time_pt.date_local,
    time: time_pt.time_local,
    date_time: time_pt.date_time_local,
    icon: time_pt.weather.icon,
    text: time_pt.weather.text,
    restart: null
  }
  return data;
}

const createMarkersArray = (req, res, next) => {
  let { days, markers } = req.payload.data.trip;
  let marker;

  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < days[i].time_points.length; j++) {

      // if not "end_day" && not "start_day"
      if (days[i].time_points[j].status !== "end_day" &&
        days[i].time_points[j].status !== "start_day") {
        marker = createDataPoint(days[i].time_points[j]);
        markers.push(marker);
      }
      else if (days[i].time_points[j].status === "end_day") {
        marker = createDataPoint(days[i].time_points[j]);
        // don't push marker
      }
      else { // if "start_day"
        // marker still exists from "end_day"
        marker.restart_data = createDataPoint(days[i].time_points[j]);
        // marker w/ two sets of weather data: 1) arrival time 2) departure time
        markers.push(marker);
      }
    }
  }
  return req;
}

module.exports = {
  createMarkersArray
}
