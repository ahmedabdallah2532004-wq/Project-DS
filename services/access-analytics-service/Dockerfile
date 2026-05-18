FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/access-analytics-service/package*.json ./services/access-analytics-service/
RUN cd services/access-analytics-service && npm ci --omit=dev

# Copy service source
COPY services/access-analytics-service/src ./services/access-analytics-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/access-analytics-service

EXPOSE 3007

CMD ["npm", "start"]
