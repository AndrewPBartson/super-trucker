# SuperTrucker

A web application for planning long-distance multi-day road trips. The user enters the starting point, destination, and number of miles to drive each day. The application produces a trip route including schedule and weather reports all along the route.

- - -

## The MEAN Stack

**Front End** \- Angular and Google Maps

**Back End** \- Node\, Express\, MongoDb

**Beta Release** \- July 1\, 2022 \(crossed fingers\)

- - -

## Overview

**Part 1 - Ui takes user input and sends request to server**

At a minimum, the user must enter a city for the starting point and a city for the destination. The user may accept the defaults for other values or elect to enter other trip parameters - miles per hour, hours driving per day, miles per day, and/or home timezone. The trip parameters are sent in a POST request to the server.

**Part 2 - Calculate a route and estimated schedule for the trip**

When the server receives a trip request, the first step is to retrieve a simple route from Google Maps based on starting point and destination as entered by the user. After the initial route from Google Maps is decoded, a rough estimate of the schedule is made. Then there is another call to Google Maps API, this time with multiple destinations, one for each location on the schedule. This is followed by calculations that produce an improved schedule. For a coast-to-coast trip, the server repeats this improvement process three or four times until an accurate and suitable schedule is created. Depending on the length of the trip, the resulting schedule includes 5 to 20 locations, with ETA for each location. (Just give a screenshot - For example, a driver might begin at 8 am in Gallup NM, then pass through Williams AZ at 11:14 am, amd arrive in Needles CA at 2:03 pm.)

**Part 3 - Obtain and sort weather data**

For each location on the schedule, the server gathers weather data for the next eight days. Weather data is gathered from two sources: Open Weather Map and US National Weather Service. From this data, the app pulls out the weather forecast that is relevant for each time and location on the schedule. While calculating the schedule and selecting relevant weather data, the server adjusts for the timezone differences. Two times are shown for each location - 1) local time 2) time at user's home. The scheduled is summarized by days, so that locations, arrival times, and weather reports for each day are grouped together.

**Part 4 - Display trip schedule - location, time, and weather**

When the response comes back to the client, the route is displayed in two ways - 1) In the form of table, like a train schedule 2) On a map with weather icons along the highways. At a glance, the user can see the probable weather along the route and the potential for weather hazards such as ice and snow.

**About Weather APIs**

* Open Weather Map
    * openweathermap.org
    * Provides superior temperature data for four periods of the day - 6 pm to midnight, midnight to 6 am, 6 am to noon, noon to 6 pm
    * Provides timezone for each location
* US National Weather Service API
    * weather.gov
    * Provides superior highly specific icons and more detailed weather summary
    * About 5% of requests to weather.gov API fail with status 503
    * For each failed request, the server sends a 2nd request to scrape data from weather.gov html version which is more reliable but less complete

**Features in future release**

* Ability to save a "Trip Template" for recurring deliveries and routes
* Improve and optimize the application for mobile devices
* Ability to find services along route -
    * Truck stops
    * Hotels
    * Repair shops and tow trucks

- - -

![Application with empty form, no user input](./imgs_readme/app_no_input.png?raw=true)

- - -

![Application including user input and advanced options](./imgs_readme/app_w_input.png?raw=true)

- - -

<!-- **scripts - package.json**

```
- "ng": "ng",
- "start": "node server/server.js",
- "start-backend": "nodemon server/server.js",
- "start-frontend": "npm start --prefix web-mvc",
- "dev": "concurrently \"npm run start-frontend\" \"npm run start-backend\"",
- "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix web-mvc && npm run build --prefix web-mvc"

During development - npm run dev
```

**scripts - web-mvc/package.json**

```
- "ng": "ng",
- "start": "ng serve",
- "build": "./node_modules/.bin/ng build --configuration=production --output-path=dist",
. . .
```

## Run tests

<span class="colour" style="color:rgb(201, 209, 217)">`ng test` - executes unit tests via [Karma](https://karma-runner.github.io/)</span>

<span class="colour" style="color:rgb(201, 209, 217)">`ng e2e` - executes end-to-end tests via [Protractor](http://www.protractortest.org/)</span>

## -->
