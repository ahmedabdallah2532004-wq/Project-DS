FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/metrics-service/package*.json ./services/metrics-service/
RUN cd services/metrics-service && npm ci --omit=dev

# Copy service source
COPY services/metrics-service/src ./services/metrics-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/metrics-service

EXPOSE 3001

CMD ["npm", "start"]
