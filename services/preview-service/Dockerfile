FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/preview-service/package*.json ./services/preview-service/
RUN cd services/preview-service && npm ci --omit=dev

# Copy service source
COPY services/preview-service/src ./services/preview-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/preview-service

EXPOSE 3003

CMD ["npm", "start"]
