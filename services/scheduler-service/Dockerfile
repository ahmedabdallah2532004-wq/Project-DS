FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/scheduler-service/package*.json ./services/scheduler-service/
RUN cd services/scheduler-service && npm ci --omit=dev

# Copy ecosystem.config.js
COPY services/scheduler-service/ecosystem.config.js ./services/scheduler-service/

# Copy service source
COPY services/scheduler-service/src ./services/scheduler-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/scheduler-service

EXPOSE 3006

CMD ["npm", "start"]
