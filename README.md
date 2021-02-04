# SuperTrucker

A web application for planning long-distance multi-day road trips. The user enters the starting point, destination, and number of miles to drive each day.

---

## Project Status - October 2020

**Completed Components**

- UI accepts user input and sends request.
- Backend creates a route and returns organized data to client.

**Current Problems**

- About 5% of backend requests to weather.gov API come back with status 503. Kind of a big deal.
- Need to calculate local time for each point along route, so need time zone for each point. Have a suitable db (mySql dump file) for obtaining time zone from zip code. However mySql has issues. So move to PostgreSql which doesn't have issues. Can't convert mySql dump file to PostgreSql. Alternative - Pay $5 a month for access to Google time zone data. Hmm...

---

## Overview

**Phase 1 - Mostly complete**

Create a route and estimated schedule for the trip. The app begins by simply retrieving a route from Google Maps based on starting point and destination as entered by the user. After the initial route from Google Maps is decoded, a rough estimate of the schedule is made. Then there is another call to Google Maps API, followed by another round of calculations that produce an improved schedule. For a coast-to-coast trip, this sequence needs to be repeated three or four times until an accurate and suitable schedule is created. The resulting schedule specifies three or more locations, including ETA. For example, a driving day might begin at 6 am in Gallup NM, with a break in Flagstaff AZ, and then stop for the night in Needles CA.

**Phase 2 - In progress**

Create a weather forecast for the trip. For each location on the schedule, a seven-day forecast is obtained from the US National Weather Service API at weather.gov. From this data, the app pulls out the weather forecast for the time/location stamp for the points on the schedule. The weather data is displayed on the schedule so that the user can easily identify potential weather hazards such as ice and snow. Crucially the user can see the timing of these hazards in relation to the timing of the proposed trip.

**Phase 3**

- Create an HTML view of route details in user-friendly format.
- This includes locations, schedule, relevant weather reports, and map. Maybe some data needs to be hidden at first.
- Proper format is especially important and challenging for mobile devices.

---

**Front end** - Angular and Google Maps

**Back end** - Node and Express

**Beta release** - January 1, 2021 (crossed fingers)

---

![Application with empty form, no user input](./imgs_readme/app_no_input.png?raw=true "Application when first loaded before user touches it")

---

![Application including user input and advanced options](./imgs_readme/app_w_input.png?raw=true "Application including user input and advanced options")

---
