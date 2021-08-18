const axios = require('axios');
const cheerio = require('cheerio');
const { getTimestampFromStr, getTimeForTimezone, calcMidnight } = require('../utilities');

// calls to NOAA api often fail. failed requests
// are noted and fixed by scraping NOAA html (not api)

const createUrlsForGaps = (req) => {
  let url;
  let { patch_data, nodes } = req.factory;
  let weather = req.payload.data.trip.weather;
  patch_data.indexes = [];
  patch_data.urls = [];
  patch_data.timezones = [];
  for (let i = 0; i < weather.length; i++) {
    if (weather[i].statusNOAA === "rejected") {
      // save index for missing data
      patch_data.indexes.push(i);
      patch_data.timezones.push(weather[i].timezone_local);
      url = 'https://forecast.weather.gov/MapClick.php?lat='
        + nodes[i].latLng.lat + '&lon=' + nodes[i].latLng.lng;
      patch_data.urls.push(url)
    }
  }
}

const getRawHtmlNOAA = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.factory.patch_data.urls.length; i++) {
    promisesArray.push(axios.get(req.factory.patch_data.urls[i]))
  }
  return Promise.allSettled(promisesArray);
}

const beginForecast = ($, timezone) => {
  // pull weather data and date string from NOAA html
  let valid_date = $('a:contains("Forecast Valid")');
  let date_str = valid_date.parent().next().text();
  console.log('should be begin day midnight: [date_str] :>> ', date_str);
  let begin_day_midnight = calcMidnight(getTimestampFromStr(date_str, timezone));
  let data_1 = {
    forecast_rows: $('div.row-forecast'),
    main_panels: $('div.tombstone-container'),
    valid_date: valid_date,
    date_str: date_str,
    // set 1st time period (start and end) for this location
    // 12 hr periods run from 6 am to 6 pm, and from 6 pm to 6 am
    begin_day_midnight: begin_day_midnight,
    period_start: begin_day_midnight - 21600000,
    period_end: begin_day_midnight + 21600000
  }
  return data_1;
}

const buildForecastArray = ($, data) => {
  // create snapshots (weather data for place at time) and
  // push to array of 12-hour periods for this location
  let forecast12hour = [];
  let period_start = data.period_start;
  let period_end = data.period_end;
  let icon, text_short, text_long, snapshot;
  for (let j = 0; j < data.forecast_rows.length; j++) {
    text_long = $(data.forecast_rows[j]).find('div.forecast-text').text();
    // if there is main_panels[] data for this time period
    if (data.main_panels[j]) {
      icon = $(data.main_panels[j]).find('img.forecast-icon').attr('src');
      if ($(data.main_panels[j]).find('p.short-desc br').length) {
        text_short = $(data.main_panels[j])
          .find('p.short-desc')
          .removeAttr('clear')
          .text()
          .replace(/([a-z])([A-Z])/g, '$1 $2')
      } else {
        text_short = $(data.main_panels[j]).find('p.short-desc').text();
      }
    } else {  // no main_panel, create text_short from forecast_row
      // reformat this text if it's more than 'medium' sized - 
      // remove leading 'A '
      // replace ' percent' with '%'
      // replace ' possibly a ' with ' possible '
      // replace 'Thunderstorm' with 'T-storm'
      // replace ' and/And ' with '&'
      // truncate when encounter these:
      //  ', with'     ', mainly'    ' between'    ' before'   ' after'
      // capitalize 1st letters
      text_short = text_long.substring(0, 25);
    }
    snapshot = {
      start_12: period_start,
      end_12: period_end,
      "icon_NOAA": ('https://forecast.weather.gov/' + icon),
      "text12": text_long,
      "text12short": text_short
    }
    forecast12hour.push(snapshot)
    // increment to next time period
    period_start += 43200000
    period_end += 43200000
  }
  return forecast12hour;
}

const patchMissingData = (gaps, req) => {
  // if promises were rejected
  if (gaps.length > 0) {
    let data_1;
    for (let i = 0; i < gaps.length; i++) {
      if (gaps[i].value.status === 200) {
        const $ = cheerio.load(gaps[i].value.data);
        data_1 = beginForecast($, req.factory.patch_data.timezones[i]);
        req.payload.data.trip.weather[req.factory.patch_data.indexes[i]].forecast12hour =
          buildForecastArray($, data_1);;
        req.payload.data.trip.weather[req.factory.patch_data.indexes[i]].hasNOAAHtml =
          req.payload.data.trip.weather[req.factory.patch_data.indexes[i]].forecast12hour.length !== 0;
      }
    }
  }
}

const checkDataNOAA = (req, res, next) => {
  createUrlsForGaps(req)
  return getRawHtmlNOAA(req, res, next)
    .then(results => {
      patchMissingData(results, req);
      return req;
    })
}

module.exports = {
  checkDataNOAA
}