FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --production --network-timeout 1000000
COPY . .
RUN yarn build

FROM nginx:1.20.1-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY --from=builder /usr/src/app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]