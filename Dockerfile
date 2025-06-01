# Use the official Node.js 20 image (LTS, stable for Puppeteer)
FROM node:20-slim

# Install necessary dependencies for Chromium
RUN apt-get update && \
    apt-get install -y wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libnspr4 libnss3 libxcomposite1 libxdamage1 libxrandr2 \
    xdg-utils --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (this will also download Chromium via Puppeteer)
RUN npm install

# Copy the rest of your code
COPY . .

# Expose no ports (since this is a bot, not a web server)

# Start the bot
CMD ["node", "mooncycle-bot.js"] 