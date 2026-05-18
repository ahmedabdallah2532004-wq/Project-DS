FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/compression-service/package*.json ./services/compression-service/
RUN cd services/compression-service && npm ci --omit=dev

# Copy service source
COPY services/compression-service/src ./services/compression-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/compression-service

EXPOSE 3004

CMD ["npm", "start"]
