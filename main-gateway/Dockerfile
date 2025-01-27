FROM node:alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy gateway application
COPY gateway.js .

# Copy and set permissions for start script
COPY start.sh .
RUN chmod +x start.sh

# Default environment variables
ENV SERVER_PORT = 8080
ENV SERVER_IP = "127.0.0.1"
ENV SERVER_NAME = "srv"

EXPOSE 8080

# Start main gateway
CMD ["sh", "/app/start.sh"]



