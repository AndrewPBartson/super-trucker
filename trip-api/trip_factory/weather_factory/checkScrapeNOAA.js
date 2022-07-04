const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

// Calls to NOAA api often fail. In that case -
// Plan b - scrape data from NOAA html (not NOAA api)
// Plan c - create 12-hour forecast from OWM data, data is less accurate

const createUrlsForGaps = (req) => {
  let url;
  let { patch_data, nodes } = req.factory;
  let weather = req.payload.data.trip.weather;
  let patchIndexesStr = '';
  patch_data.indexes = [];
  patch_data.urls = [];
  for (let i = 0; i < weather.length; i++) {
    if (weather[i].statusNOAA === "rejected") {
      if (nodes[i]) {
        // save index for location that's missing data
        patch_data.indexes.push(i);
        // for testing - build string of indexes of locations with missing data
        patchIndexesStr += i + ',';
        url = `https://forecast.weather.gov/MapClick.php?lat=${nodes[i].latLng.lat}&lon=${nodes[i].latLng.lng}`;
        patch_data.urls.push(url)
        weather[i].city_3noaa = 'NOAA api fail, try scraping';
      }
    }
    else {
      weather[i].city_3noaa = 'NOAA api ok, no scraping';
    }
  }
  console.log('patchIndexesStr ', patchIndexesStr);
}

const getRawHtmlNOAA = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.factory.patch_data.urls.length; i++) {
    promisesArray.push(axios.get(req.factory.patch_data.urls[i]))
  }
  return Promise.allSettled(promisesArray);
}

const getTimeCutoffs = (timezone) => {
  // determine the timestamp cutoffs for 12-hour periods according
  // to the local timezone
  // NOAA data is in 12 hr periods that run from
  // 6 am to 6 pm, and from 6 pm to 6 am.
  let period_start;
  let now_ = Date.now();
  let current_date = new Date(now_);
  let momentX = moment.utc(current_date).tz(timezone);
  let day_num = momentX.day();
  let midnight = momentX.startOf('day').valueOf();
  let yesterday_6pm = midnight - 21600000;
  let today_6am = yesterday_6pm + 43200000;
  let today_6pm = today_6am + 43200000;

  if (now_ >= yesterday_6pm && now_ < today_6am) {
    period_start = yesterday_6pm;
  } else if (now_ >= today_6am && now_ < today_6pm) {
    period_start = today_6am;
  } else if (now_ >= today_6pm) {
    period_start = today_6pm;
  }

  let cutoffs = {
    start_1st_period: period_start,
    start_day_of_week: day_num,
    midnight_0: midnight,
    midnight_1: midnight + 86400000,
    yesterday_6pm: yesterday_6pm,
    today_6am: today_6am,
    today_6pm: today_6pm,
    tomorrow_6am: today_6pm + 43200000
  }
  return cutoffs;
}
/*
let hours_6 = 21600000
let hours_10 = 36000000
let hours_12 = 43200000
let hours_14 = 50400000
let hours_18 = 28800000
let hours_24 = 86400000
*/

const calculateTimesFromLabel = (data_point, cutoffs) => {
  // Data scraped from NOAA does not have timestamps or any easy-to-use time
  // data. Labels are used to determine which 12 hour period a timestamp
  // falls into. Quite often a data_point (12 hour forecast) is
  // labeled differently and begins with a different period than other
  // locations. One location may start with "Tonight" but a nearby
  // location may start with "This Afternoon".
  switch (data_point.row_label) {
    case 'Overnight':
      data_point.start_12 = cutoffs.yesterday_6pm;
      data_point.end_12 = cutoffs.today_6am;
      break;
    case 'Today':
      data_point.start_12 = cutoffs.today_6am;
      data_point.end_12 = cutoffs.today_6pm;
      break;
    case 'This Afternoon':
      data_point.start_12 = cutoffs.today_6am;
      data_point.end_12 = cutoffs.today_6pm;
      break;
    case 'Tonight':
      data_point.start_12 = cutoffs.today_6pm;
      data_point.end_12 = cutoffs.tomorrow_6am;
      break;
    default:
      data_point.start_12 = cutoffs.today_6am;
      data_point.end_12 = cutoffs.today_6pm;
      break;
  }
  return data_point.end_12;
}

const pullDataFromScrapes = ($, cutoffs) => {
  let data_mixed = {
    rows: $('div.row-forecast'),
    row_labels: $('div.forecast-label'),
    panels: $('div.tombstone-container'),
    panel_labels: $('p.period-name'),
    current_weather: $('#current-conditions-summary'),
    period_start: cutoffs.start_1st_period,
    period_end: cutoffs.start_1st_period + 43200000
  }
  let data_sorted = [];
  let data_point = {};
  let text_long;
  let time_tracker;
  // only adding row data for now bc need to check/adjust time periods for panel data.
  // When a location has hazardous weather warning, the warning shows up
  // in 1st panel which pushes everything over one, 1st panel becomes 2nd panel etc
  for (let i = 0; i < data_mixed.rows.length; i++) {
    text_long = $(data_mixed.rows[i]).find('div.forecast-text').text()
    data_point = {
      row_label: $(data_mixed.row_labels[i]).text(),
      panel_label: null,
      start_12: null,
      end_12: null,
      icon_NOAA: null,
      text12: text_long,
      text12short: text_long.substring(0, 52)
    };
    if (i === 0) { // for first 12-hour period, set start and end times using label
      time_tracker = calculateTimesFromLabel(data_point, cutoffs);
    } else { // use addition to assign times to remaining periods
      data_point.start_12 = time_tracker;
      time_tracker += 43200000;  // increment to next 12 hour period
      data_point.end_12 = time_tracker;
    }
    data_sorted.push(data_point);
  }
  // data_mixed.panels - has element for each panel
  // data_sorted - created from data_mixed.rows
  //     and has element for each row, length is longer than panels
  // there are 13 to 15 rows but only 8 or 9 panels
  let panel_label;
  let row_1_label = $(data_mixed.row_labels[0]).text().replace(/\s/g, '');
  for (let j = 0; j < data_mixed.panels.length; j++) { // search for panel w/ matching name
    panel_label = $(data_mixed.panel_labels[j]).text();
    // if name of current panel matches name of first row
    if (row_1_label === panel_label) {
      // now data_mixed.panel[j] is aligned with data_sorted[0] (aka data_sorted[k]).
      // We skipped any panel that was a hazardous weather warning.
      // after aligning a panel with a matching row, data from each panel is
      // simply loaded sequentially into each data_point. Then break out
      let text_short;
      for (let k = 0; k < data_mixed.panels.length; k++) {
        // load data from each panel[j + k] into each element of data_sorted[k]
        data_sorted[k].panel_label = $(data_mixed.panel_labels[j + k]).text();
        data_sorted[k].icon_NOAA = $(data_mixed.panels[j + k]).find('img.forecast-icon').attr('src');
        // if text has multiple lines
        if ($(data_mixed.panels[j + k]).find('p.short-desc br').length) {
          text_short = $(data_mixed.panels[j + k])
            .find('p.short-desc')
            .removeAttr('clear')
            .text()
          text_short = text_short.replace(/([a-z])([A-Z])/g, '$1 $2')
        } else { // if text has single line
          text_short = $(data_mixed.panels[j + k]).find('p.short-desc').text();
        }
        data_sorted[k].text12short = text_short;
        data_sorted[k].icon_NOAA =
          `https://forecast.weather.gov/${$(data_mixed.panels[j + k]).find('img.forecast-icon').attr('src')}`
      }
      break;
    }
  }
  return data_sorted;
}
/*
  // option - reformat text if no main panel for that day -
  // don't reformat - adds too much overhead for too little benefit
  // remove leading 'A '
  // replace ' percent' with '%'
  // replace ' possibly a ' with ' possible '
  // replace 'Thunderstorm' with 'T-storm'
  // replace ' and/And ' with '&'
  // truncate when encounter these:
  //  ', with'     ', mainly'    ' between'    ' before'   ' after'
  // capitalize 1st letters
*/

const create12hourForecasts = ($, timezone) => {
  let time_cutoffs = getTimeCutoffs(timezone);
  let forecast_12hour = pullDataFromScrapes($, time_cutoffs);
  return forecast_12hour
}

const patchMissingData = (gaps, req) => {
  let { weather } = req.payload.data.trip;
  let { indexes } = req.factory.patch_data;
  // if promises were rejected
  if (gaps.length > 0) {
    for (let i = 0; i < gaps.length; i++) {
      if (gaps[i].value && gaps[i].value.status === 200) {
        // load raw html scraped from NOAA for this location
        let $ = cheerio.load(gaps[i].value.data);
        weather[indexes[i]].forecast12hour = create12hourForecasts($, weather[indexes[i]].timezone_local);
        if (weather[indexes[i]].forecast12hour.length > 0) {
          weather[indexes[i]].hasNOAAHtml = true;
          weather[indexes[i]].city_3noaa += ', scrape ok';
        }
        else {
          weather[indexes[i]].hasNOAAHtml = false;
          weather[indexes[i]].city_3noaa += ', scrape failed';
        }
      }
    }
  }
}

const fixMissingData = (req, res, next) => {
  createUrlsForGaps(req)
  return getRawHtmlNOAA(req, res, next)
    .then(results => {
      patchMissingData(results, req);
      return req;
    })
}

module.exports = {
  fixMissingData
}