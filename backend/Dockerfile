FROM node:22-slim

# Instal curl untuk healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Jalankan seed setiap kali container up, lalu start server
CMD npm run seed && npm run dev
