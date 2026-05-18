FROM node:18-alpine

RUN npm install pm2 -g

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3007

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
