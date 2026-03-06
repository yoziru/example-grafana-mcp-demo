# Use official Node.js LTS image
FROM node:lts-alpine

WORKDIR /usr/src/app

ENV OTEL_SERVICE_NAME=demo-app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"] 