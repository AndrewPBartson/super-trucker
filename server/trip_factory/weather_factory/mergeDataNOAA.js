const addSnapshot12 = (pointNOAA) => {
  // NOAA data is in 12 hour increments
  let snapshot = {
    "start_12": Date.parse(pointNOAA.startTime),
    "end_12": Date.parse(pointNOAA.endTime),
    "temperature": pointNOAA.temperature,
    "windSpeed": pointNOAA.windSpeed,
    "icon_NOAA": pointNOAA.icon,
    "text12short": pointNOAA.shortForecast,
    "text12": pointNOAA.detailedForecast
  }
  return snapshot;
}

const addNodeForecastNOAA = (dataNOAA) => {
  let forecast12hour = [];
  if (dataNOAA.status === "fulfilled") {
    for (let i = 0; i < dataNOAA.value.data.properties.periods.length; i++) {
      forecast12hour.push(addSnapshot12(dataNOAA.value.data.properties.periods[i]))
    }
  }
  return forecast12hour;
}

const saveDataNOAA = (dataNOAA, weather) => {
  for (let i = 0; i < dataNOAA.length; i++) {
    console.log('NOAA promise[' + i + '] :>> ', dataNOAA[i].status);
    weather[i].statusNOAA = dataNOAA[i].status;
    weather[i].forecast12hour = (addNodeForecastNOAA(dataNOAA[i]));
    weather[i].hasNOAAData = weather[i].forecast12hour.length !== 0
  }
}

module.exports = {
  saveDataNOAA
}
