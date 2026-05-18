FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json from the service directory
COPY services/backup-service/package*.json ./services/backup-service/
RUN cd services/backup-service && npm ci --omit=dev

# Copy service source
COPY services/backup-service/src ./services/backup-service/src

# Copy shared folders
COPY contracts ./contracts
COPY shared ./shared

WORKDIR /usr/src/app/services/backup-service

EXPOSE 3008

CMD ["npm", "start"]
