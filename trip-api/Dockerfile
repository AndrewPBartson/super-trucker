FROM node:16.14.2-alpine3.14

WORKDIR /usr/share/trip-api

COPY . .
RUN npm install

EXPOSE 8880

CMD ["npm", "run", "start-trip-api"]