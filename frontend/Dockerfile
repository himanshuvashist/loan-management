# Stage one
FROM node:lts as builder_base

ARG api_port

ENV REACT_APP_API_URL=$api_port

COPY package.json /app/

WORKDIR /app

RUN npm install --silent

COPY ./src /app/src/
COPY ./public /app/public

RUN npm run build

# Stage two
FROM nginx:stable

# COPY . nginx/nginx.conf /etc/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder_base /app/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]