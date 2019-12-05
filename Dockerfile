FROM node:13.2.0-alpine

WORKDIR /usr/app

COPY package.json .

RUN apk update && apk add --no-cache --virtual .gyp python make g++ \
    && npm install --quiet \
    && apk del .gyp

RUN apk add --no-cache gcompat

COPY . .