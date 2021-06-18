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

const createDaysArray = (req, res, next) => {
  // viewFactoryReport(req.factory);
  let time_points = req.factory.time_points;
  let days = req.payload.data.trip.days;
  let emptyDay;
  let dayTotals = {};
  let day_count = 0;

  for (let i = 0; i < time_points.length; i++) {
    if (time_points[i].status === "start_trip" || time_points[i].status === "start_day") {
      // start new day - add element to days[]
      emptyDay = {
        time_points: [],
        totals: {}
      }
      days.push(emptyDay);
    }
    if (time_points[i].status === "start_day") {
      day_count++;
    }
    if (time_points[i].status === "end_day" || time_points[i].status === "end_trip") {
      days[day_count].totals.miles_today = time_points[i].miles_today;
      days[day_count].totals.hours_today = time_points[i].hours_today;
    }
    // add time_point to time_points[] of current day
    days[day_count].time_points.push(time_points[i])
  }
  return req;
}

module.exports = {
  createDaysArray
}


