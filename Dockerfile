# Use the official Node.js 20 image (LTS, stable for Puppeteer)
FROM node:20-slim

# Install Chrome dependencies and Chrome itself
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    apt-get clean && \
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