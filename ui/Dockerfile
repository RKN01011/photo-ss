FROM node:latest

RUN mkdir -p /usr/app/ui/
WORKDIR /usr/app/ui/

COPY . /usr/app/ui/

RUN npm install

CMD npm run start
