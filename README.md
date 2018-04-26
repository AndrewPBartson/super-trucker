Travelers Helper is a web application that helps long-distance drivers plan a road trip. 
Based on your rate of travel, the application calculates appropriate stopping places and finds a nearby lodging option. 


This project consists of two repositories.
This repository, travel_plannerBE, has the back end components. Front end components are in a separate repository with a matching name: travel_plannerFE.


Install and Launch Instructions -

For travel_plannerBE repository -

Clone the repo into a separate directory.
In the command line terminal:
"npm install"
"npm start"

Repeat for travel_plannerFE repository - 

Clone the repo into a separate directory.
In the command line terminal:
"npm install"
"npm start"

The front end components run a server on localhost:3000.
In this version of the project, the url links in the front end components are configured to
send HTTP requests to localhost:8001.

The back end components run a server on localhost:8001.
The back end sends HTTP requests to Google Directions API and Google Places API.
