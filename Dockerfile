FROM mhart/alpine-node:8

ENV NODE_VERSION 8.9.4

RUN apk add --no-cache make gcc g++ python bash

WORKDIR /var/parcelPk

COPY lib/ /var/parcelPk/lib/
COPY bin/ /var/parcelPk/bin/
COPY config/ /var/parcelPk/config/
COPY public/ /var/parcelPk/public/
COPY routes/ /var/parcelPk/routes/
COPY views/ /var/parcelPk/views/

COPY app.js /var/parcelPk/
COPY package.json /var/parcelPk/
COPY gulpfile.js /var/parcelPk/

RUN npm install

VOLUME /var/parcelPk/data

EXPOSE 1111
ENTRYPOINT ["npm", "start"]
