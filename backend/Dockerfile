# Stage one
FROM node:lts as builder_base

COPY package.json package-lock.json /app/

WORKDIR /app

COPY . ./

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]