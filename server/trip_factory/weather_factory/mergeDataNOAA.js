const addSnapshot12 = (pointNOAA) => {
  // NOAA data is in 12 hour increments
  let snapshot = {
    "start": Date.parse(pointNOAA.startTime),
    "end": Date.parse(pointNOAA.endTime),
    "temperature": pointNOAA.temperature,
    "windSpeed": pointNOAA.windSpeed,
    "icon_NOAA": pointNOAA.icon,
    "text12short": pointNOAA.shortForecast,
    "text12": pointNOAA.detailedForecast
  }
  return snapshot;
}

const AddPointForecastNOAA = (dataNOAA) => {
  let forecast12hour = [];
  if (dataNOAA.status === "fulfilled") {
    for (let i = 0; i < dataNOAA.value.data.properties.periods.length; i++) {
      forecast12hour.push(addSnapshot12(dataNOAA.value.data.properties.periods[i]))
    }
  }
  return forecast12hour;
}

const injectDataNOAA = (dataNOAA, req) => {
  for (let i = 0; i < dataNOAA.length; i++) {
    console.log('dataNOAA[i].status :>> ', dataNOAA[i].status);
    // add NOAA data to req.factory
    req.factory.weather[i].statusNOAA = dataNOAA[i].status;
    req.factory.weather[i].forecast12hour = (AddPointForecastNOAA(dataNOAA[i]));
    // optional - add NOAA data to payload for testing
    req.payload.data.trip.weather[i].statusNOAA = dataNOAA[i].status;
    req.payload.data.trip.weather[i].forecast12hour = (AddPointForecastNOAA(dataNOAA[i]));
  }
  return req;
}

module.exports = {
  injectDataNOAA
}