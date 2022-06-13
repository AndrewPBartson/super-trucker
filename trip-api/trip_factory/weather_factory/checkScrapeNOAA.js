const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

// calls to NOAA api often fail. In that case -
// plan b - scrape data from NOAA html (not NOAA api)
// plan c - create 12-hour forecast from OWM data, data is less accurate

const createUrlsForGaps = (req) => {
  let url;
  let { patch_data, nodes } = req.factory;
  let weather = req.payload.data.trip.weather;
  let patchIndexesStr = '';
  patch_data.indexes = [];
  patch_data.urls = [];
  patch_data.timezones = [];
  for (let i = 0; i < weather.length; i++) {
    if (weather[i].statusNOAA === "rejected") {
      if (nodes[i]) {
        // save index for location that is missing data
        patch_data.indexes.push(i);
        // for testing - build string of indexes of locations with missing data
        patchIndexesStr += i + ',';
        patch_data.timezones.push(weather[i].timezone_local);
        url = `https://forecast.weather.gov/MapClick.php?lat=${nodes[i].latLng.lat}&lon=${nodes[i].latLng.lng}`;
        patch_data.urls.push(url)
        weather[i].city_3noaa = 'NOAA api fail, try scraping';
      }
    }
    else {
      weather[i].city_3noaa = 'NOAA api ok, no scraping';
    }
  }
  // console.log('patchIndexesStr :>> ', patchIndexesStr);
}

const getRawHtmlNOAA = (req, res, next) => {
  let promisesArray = []
  for (let i = 0; i < req.factory.patch_data.urls.length; i++) {
    promisesArray.push(axios.get(req.factory.patch_data.urls[i]))
  }
  return Promise.allSettled(promisesArray);
}
/* 
let hours_6 = 21600000
let hours_10 = 36000000
let hours_12 = 43200000
let hours_14 = 50400000
let hours_18 = 28800000
let hours_24 = 86400000
*/
const setFirst12hourPeriod = (timezone) => {
  // NOAA data is in 12 hr periods that run from
  // 6 am to 6 pm, and from 6 pm to 6 am
  let period_start;
  let now_ = Date.now();
  let current_date = new Date(now_);
  let momentX = moment.utc(current_date).tz(timezone);
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
  return period_start;
}

const extractDataFromScrapes = ($, period_start) => {
  // edge case - sometimes hazardous weather warning disrupt normal html structure
  // to compensate, ignore the row-forecast and tombstone container when the img

  let organizedData = {
    forecast_rows: $('div.row-forecast'),
    main_panels: $('div.tombstone-container'),
    period_start: period_start,
    period_end: period_start + 43200000
  }
  return organizedData;
}

const pushSnapshotsToArray = ($, data) => {
  // create snapshot (weather data for place at time) and
  // push to array of 12-hour periods for this location
  let forecast12hour = [];
  let period_start = data.period_start;
  let period_end = data.period_end;
  let icon, text_short, text_long, snapshot;
  // usually there are 15 forecast rows but only 8 main panels
  // edge case - sometimes there is a weather hazard warning in the first panel
  // which pushes the first data to the second panel

  // j is index for forecast rows, k is index for main panels
  // k is incremented when hazard warning occupies first panel
  for (let j = 0, k = 0; j < data.forecast_rows.length; j++, k++) {
    icon = null;
    text_long = $(data.forecast_rows[j]).find('div.forecast-text').text();
    // if there is main_panels[] data for this time period
    if (data.main_panels[k]) {
      // check for weather hazard warning which has no value for alt attribute
      if ($(data.main_panels[k]).find('img.forecast-icon').attr('alt') === undefined) {
        // console.log('found undefined alt attribute');
        k++;
      }
      icon = $(data.main_panels[k]).find('img.forecast-icon').attr('src');
      // if text has multiple lines
      if ($(data.main_panels[k]).find('p.short-desc br').length) {
        text_short = $(data.main_panels[k])
          .find('p.short-desc')
          .removeAttr('clear')
          // .find('br')
          // .replaceWith(' ')
          .text()
        text_short = text_short.replace(/([a-z])([A-Z])/g, '$1 $2')
        // to see the bad scraping, uncomment the following -
        //console.log('text_short:>> ', text_short);
      } else { // if text has single line
        text_short = $(data.main_panels[k]).find('p.short-desc').text();
      }
    } else {  // if no main_panel -
      // create text_short from forecast_row
      //
      // ideas for reformatting text - 
      // remove leading 'A '
      // replace ' percent' with '%'
      // replace ' possibly a ' with ' possible '
      // replace 'Thunderstorm' with 'T-storm'
      // replace ' and/And ' with '&'
      // truncate when encounter these:
      //  ', with'     ', mainly'    ' between'    ' before'   ' after'
      // capitalize 1st letters
      //
      // don't reformat - adds too much overhead for too little benefit?
      text_short = text_long.substring(0, 52);
    }
    snapshot = {
      start_12: period_start,
      end_12: period_end,
      icon_NOAA: null,
      "text12": text_long,
      "text12short": text_short
    }
    if (icon) {
      snapshot.icon_NOAA = `https://forecast.weather.gov/${icon}`;
    } else {
      snapshot.icon_NOAA = null;
    }
    forecast12hour.push(snapshot)
    // increment by 12 hours to next time period
    period_start += 43200000
    period_end += 43200000
  }
  return forecast12hour;
}

const create12hourForecast = ($, timezone) => {
  let initial_start = setFirst12hourPeriod(timezone);
  let next_data = extractDataFromScrapes($, initial_start);
  if (next_data) {
    return pushSnapshotsToArray($, next_data)
  }
  else {
    return [];
  }
}

const patchMissingData = (gaps, req) => {
  let { weather } = req.payload.data.trip;
  let { indexes, timezones } = req.factory.patch_data;
  // if promises were rejected
  if (gaps.length > 0) {
    for (let i = 0; i < gaps.length; i++) {
      if (gaps[i].value && gaps[i].value.status === 200) {
        // load the raw html from NOAA for this location
        let $ = cheerio.load(gaps[i].value.data);
        // 
        weather[indexes[i]].forecast12hour = create12hourForecast($, weather[indexes[i]].timezone_local_str);
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