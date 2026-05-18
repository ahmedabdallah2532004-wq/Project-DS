FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/webhook-service/package*.json ./services/webhook-service/
RUN cd services/webhook-service && npm ci --omit=dev

# Copy ecosystem.config.js
COPY services/webhook-service/ecosystem.config.js ./services/webhook-service/

# Copy service source
COPY services/webhook-service/src ./services/webhook-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/webhook-service

EXPOSE 3005

CMD ["npm", "start"]
