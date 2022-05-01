# Part 1) build-stage
# Create a node env and build ng app w/ production config

FROM node:16.14.0 as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

# Part 2) 

FROM nginx:1.20.2
# Copy dist folder from previous stage to nginx container -
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
# Copy nginx-custom.conf -
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf