# SuperTrucker

**SuperTrucker** is a web application for planning long-distance multi-day road trips. The user enters the starting point, destination, and number of miles to drive each day.  

The first task is to create a route and estimated schedule for the trip. The app begins by simply retrieving a route from Google Maps based on starting point and destination as entered by the user. After the initial route from Google Maps is decoded, a rough estimate of the schedule is made. Then there is another call to Google Maps API, followed by another round of calculations that produce an improved schedule. For a coast-to-coast trip, this sequence usually needs to be repeated three or four times until an accurate and suitable schedule is created. The resulting schedule specifies three locations for each travel day: morning, afternoon, and night. An ETA is calculated for each location.

The next task is to create a weather forecast for the trip. For each location on the schedule, a seven-day forecast is obtained from the US National Weather Service API at weather.gov. From this data, the app pulls out the weather forecast for the time/location stamp for the points on the schedule. The weather data is displayed on the schedule so that the user can easily identify potential weather hazards such as ice and snow. Crucially the user can see the timing of these hazards in relation to the timing of the proposed trip.

***

The front end is built with Angular and Google Maps.

The back end is built on Node and Express.

This project is still under development with the Beta release scheduled for January 1, 2021.
***

![Application with empty form, no user input](./imgs_readme/app_no_input.png?raw=true "Application when first loaded before user touches it")
***

![Application including user input and advanced options](./imgs_readme/app_w_input.png?raw=true "Application including user input and advanced options")
***
