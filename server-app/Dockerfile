FROM node:alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY server.js .
COPY application.js .
COPY start.sh .

RUN chmod +x start.sh

# Default environment variables
ENV SERVER_PORT=8080 \
    APP_PERIOD=5000

EXPOSE $SERVER_PORT

CMD ["sh", "/app/start.sh"]

