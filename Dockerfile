FROM node:18-alpine AS base

RUN mkdir /usr/app
WORKDIR /usr/app
COPY . /usr/app

RUN npm ci

EXPOSE 5000

CMD ["npm", "run", "start"]