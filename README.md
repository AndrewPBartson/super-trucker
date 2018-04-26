# Travelers Helper

**Travelers Helper** is a web application that helps long-distance drivers plan their road trips. 
The user enters origin, destination, and miles to travel per day. When the user clicks the **Create Trip** button, the application calculates appropriate stopping places and finds a nearby lodging option for each stopping place. 

[Link to deployed version](https://travelers-helper.herokuapp.com/)


The project is contained in two repositories: 
- **travel_plannerBE** (this repository) has back end components. 
- [**travel_plannerFE**](https://github.com/AndrewBartson/travel_plannerFE) has front end components.

## Install and launch Front End components -

- "git clone https://github.com/AndrewBartson/travel_plannerFE.git"
- "npm install"
- "npm start"

## Install and launch Back End components -

- "git clone https://github.com/AndrewBartson/travel_plannerBE.git"
- "npm install"
- "npm start"

This version of the project is set up for the server to run locally. The links in the front end components are configured to send HTTP requests to localhost:8001. The back end components run a server on localhost:8001. The back end sends HTTP requests to Google Directions API and Google Places API.

Please visit [the deployed version of the project](https://travelers-helper.herokuapp.com/)