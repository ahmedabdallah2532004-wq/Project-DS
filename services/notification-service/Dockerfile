FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/notification-service/package*.json ./services/notification-service/
RUN cd services/notification-service && npm ci --omit=dev

# Copy service source
COPY services/notification-service/src ./services/notification-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/notification-service

EXPOSE 3002

CMD ["npm", "start"]
