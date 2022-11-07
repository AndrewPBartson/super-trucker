<div align="center">
<img id="anchor_on_top" alt="Super Trucker - Weather on your route" width="70%" src="./imgs_readme/banner.jpg">
</div>

<details open="open">
<summary>Table of Contents</summary>

- [How can this app help me?](#how-can-this-app-help-me)
- [Competitive advantage](#providing-a-competitive-advantage)
- [Tech stack](#tech-stack)
- [Under the hood](#under-the-hood)
  1. [Send trip request to server](#part-1---the-user-sends-a-trip-request)
  2. [Calculate route](#part-2---build-the-trip)
  3. [Display trip data in browser](#part-3---show-results-to-the-user)
- [Deployment in containers](#deployment-in-containers)
- [Sources for weather data](#sources-for-weather-data)
- [What's next for this project?](#whats-next---wish-list-for-additional-features)
- [Screenshots](#screenshots)

</details>

## How can this app help me?

<table>
<tr>
<td>

- SuperTrucker is for planning long-distance multi-day road trips
- The user enters starting point, destination, and number of miles to drive each day
- The app produces a trip route, schedule, and weather reports along the route
- [Link to deployed app](https://supertrucker.app)
</td>
</tr>
</table>

---

## Providing a Competitive Advantage

<table>
<tr>
<td>

### :truck: &nbsp; Target audience

- Trucking Industry
- Drivers, fleet managers, load planners

### :snowflake: &nbsp; Anticipate weather delays

- This app helps you to anticipate snow and ice storms during winter. More accurate and high resolution weather information can reduce the number of late deliveries. Obviously this improves your cred with customers.

### :alarm_clock: &nbsp; Estimate ETA quickly

- This app provides an accurate estimate of the earliest realistic arrival time for a shipment. It allows you to quickly figure out whether an expedited delivery schedule is impossible, difficult, or just normal trucking.

- The most profitable loads are available only for a very short time before being taken. By saving valuable minutes, this app allows you to secure desirable loads before your competitors.

</td>
</tr>
</table>

---

### Tech Stack

<table>
<tr>
<td>

- <b>Containers</b> -- Docker / Kubernetes
- <b>Front End</b> -- Angular / Google Maps
- <b>Back End</b> -- Node / Express / MongoDb
- <b>External APIs</b> -- Google Directions / US Weather Service / Open Weather Map

</td>
</tr>
</table>

---

### Under the Hood

<table>
<tr>
<td>

#### **Part 1** - The user sends a trip request

    Gather user input and send request to server

<details>
<summary>More</summary>

At a minimum, the user must enter two locations - starting point and destination. The user has the option to enter other trip parameters - miles per hour, hours driving per day, miles per day, and/or home timezone. Trip parameters are sent in a POST request to the trip-api server.

</details>

</td>
</tr>
</table>

<table>
<tr>
<td>

#### **Part 2** - Build the trip

    Calculate route and stopping places for the trip

<details>
<summary>More</summary>

When trip request comes in, the trip server initially retrieves a simple route from Google Directions API, a route from starting point to destination as specified by the user. Building on this simple route, intermediate locations are added. This data is then submitted to Google Directions API to produce a route with multiple stops. However, thus far, the distances between the stops are random. Further calculations plus a third call to Google Directions API are needed to adjust the stops so that they are evenly spaced along the route.

</details>

    Obtain and sort weather data

<details>
<summary>More</summary>

For each location on the route, the server obtains weather data for the next eight days. Weather data is gathered from two sources: Open Weather Map and US Weather Service. From this data, the app pulls out the 12-hour forecast that is relevant for each time and location on the schedule.

While calculating the schedule and selecting relevant weather data, the server adjusts for timezones. Two times are shown for each location - 1) local time 2) time at user's home timezone.

Finally the data, including locations, arrival times, and relevant weather reports, is organized into sections, one for each day.

</details>

</td>
</tr>
</table>

<table>
<tr>
<td>

#### **Part 3** - Show results to the user

    Display trip information - Route, locations, times, weather

<details>
<summary>More</summary>

When the response comes back to the browser, results are displayed in two formats

- Expandable table - consists of accordion UI elements that show or hide the details for each day
- Map - consists of a series of weather icons displayed along the highways with pop-up information windows

The route and schedule can have up to 24 locations, with ETA for each location. For example, in [screenshot 6](#6---expanded-weather-for-one-day), the driver starts out from Pecos TX at 6 am, passes through Carlsbad NM at 8:37 am, and arrives in Alamogordo NM at 12:40 pm.

</details>

</td>
</tr>
</table>

<div align="center">
<button >
  <a href="#anchor_on_top">Back to the Top</a>
</button>
</div>

---

### Deployment in Containers

- Consists primarily of four containers plus one database
- Deployed on Digital Ocean

<details>
<summary>
View flow chart of Kubernetes containers and services<br> 
<img style="margin-right: 20px" src="./imgs_readme/containers_thumbnail.jpg" alt="Flowchart of K8s architecture"/></summary>

<table>
<tr>
<td>

<img src="./imgs_readme/superTcontainers.jpg" alt="Flowchart of Kubernetes architecture"/>

</td>
</tr>
</table>

</details>

<table>
<tr>
<td>

1. ### **nginx-ingress**

- Secure entry point that directs traffic to internal services
- All further traffic and responses are encrypted - HTTPS / TLS / SSL

2. ### **web-mvc**

- Frontend built on Angular
- Angular Material Design - UI library
- Google Map

3. ### **trip-api**

- NodeJS server
- Creates a trip route with properly spaced locations
- Calculates the schedule with arrival times expressed in two timezones
- Gathers weather forecasts for each location, including web-scraping
- Pulls out weather data for the timestamp when user is scheduled to be at that location

4. ### **user-api**

- NodeJS server
- Enables the user to register and login
- Provides secure access using JWT tokens, Bcrypt, and Passport

5. ### **MongoDb**

- Mongo database is deployed separately on MongoDB Atlas

</td>
</tr>
</table>

<div align="center">
<button >
  <a href="#anchor_on_top">Back to the Top</a>
</button>
</div>
 
---

### Sources for Weather Data

<table>
<tr>
<td>

<details>
<summary><b>Open Weather Map API</b></summary>

- Provides most data in 24-hour periods - midnight to midnight
- except temperature data is in 6-hour periods -
  - Midnight to 6 am
  - 6 am to noon
  - Noon to 6 pm
  - 6 pm to midnight
- Temperature data is superior to other sources because of the better resolution (6 hour periods)
- Provides timezone for each location - awesome
- Example URL
  - https://api.openweathermap.org/data/2.5/onecall?lat=35.5&lon=97.5&appid={APIkey}
- API key is required
</details>

<details>
<summary><b>US Weather Service API</b></summary>

- provides data in 12-hour periods -
  - 6 am to 6 pm
  - 6 pm to 6 am
- provides better icons and weather summary compared to Open Weather Map
- Two separate API calls are required to obtain forecast for each location
  - First URL example ->
  - [https://api.weather.gov/points/35.5,-97.5](https://api.weather.gov/points/35.5,-97.5)
  - First response provides the second URL ->
  - [https://api.weather.gov/gridpoints/OUN/97,94/forecast](https://api.weathergov/gridpoints/OUN/97,94/forecast)
  - Second URL returns the actual forecast (except when the weather server returns an error)
- No API key is required
</details>

<details>
<summary><b>US Weather Service HTML (web page)</b></summary>

- About 5% of requests to api.weather.gov fail with status 500 or 503
- For each failed request, data is gathered from forecast.weather.gov, which is the US Weather Service consumer-facing web page
- The weather data is embedded in html code and must be extracted, or "scraped"
- This data is almost the same as data from USWS API but is less complete
- Example URL
  - <a href="https://forecast.weather.gov/MapClick.php?lat=35.5&lon=-97.5">https://forecast.weather.gov/MapClick.php?lat=35.5&lon=-97.5</a>
- No API key is required
</details>

<details>
<summary><b>Time limits for weather data</b></summary>

- US Weather Service data covers approximately the next seven days
- Open Weather Map data covers the next eight days
- For any times on the schedule that are beyond these time frames, the schedule informs the user, "No Weather Data for [ date ]"

</details>

</td>
</tr>
</table>

---

### What's next? - Wish list for additional features

<table>
<tr>
<td>

- Convert the frontend to React / Redux to facilitate advanced features
- Add the ability to save a "trip template" for recurring trips
- Add the ability to find services along the route such as -
  - Hotels
  - Truck stops
  - Repair shops and tow trucks
- Research target audience to learn how the app can better serve them
- Implement advertising, subscriptions, or other monetization strategies
- Fix login and register capabilities which broke along the way :)
- Create mobile version of application
- Extend the app to more countries
  - At this time, trip data is only available for the US and Canada
  - Mexico is the next target
  - Unfortunately weather data for trips in Canada is lower quality

</td>
</tr>
</table>

<div align="center">
<button >
  <a href="#anchor_on_top">Back to the Top</a>
</button>
</div>
<br />

<table>
<tr>
<td>

### Screenshots

#### 1 - Welcome screen - Form for user input

<img src="./imgs_readme/screen1_form_w_input.jpg" alt="Form with user input"/>

<details>
<summary>Expand welcome screen to show one-click options</summary>

<table>
<tr>
<td>

<img src="./imgs_readme/screen2_form_w_settings.jpg" alt="Form with more settings"/>

</td>
</tr>
</table>

</details>

---

#### 3 - Summary of trip

<img src="./imgs_readme/screen3_trip_summary.jpg" alt="Summary of trip"/>

---

#### 4 - Details for one day

<img src="./imgs_readme/screen4_trip_day_3.jpg" alt="Details for one day"/>

---

#### 5 - Login and register

<img src="./imgs_readme/screen5_auth.jpg" alt="UI for login and register"/>

---

#### 6 - Expanded weather for one day

<img src="./imgs_readme/screen6_trip_table.jpg" alt="Expanded weather data for one day" height="700"/>

</td>
</tr>
</table>

<div align="center">
<button >
  <a href="#anchor_on_top">Back to the Top</a>
</button>
</div>
