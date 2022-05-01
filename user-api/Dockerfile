FROM node:16.14.2-alpine3.14

WORKDIR /usr/share/user-api

COPY . .
RUN npm install

EXPOSE 7770

CMD ["npm", "run", "start-user-api"]