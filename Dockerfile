FROM node:13.2.0-slim

WORKDIR /usr/app

COPY package.json .

RUN npm install --quiet

COPY . .