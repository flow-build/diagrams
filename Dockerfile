FROM node:18.14 AS base

RUN apt-get update && apt-get install -y bash curl

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app

RUN npm install

EXPOSE 5000

CMD ["node", "src/server.js"]