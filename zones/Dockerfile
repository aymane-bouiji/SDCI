FROM node:alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY gateway.js .
COPY device.js .
COPY start.sh .

RUN chmod +x start.sh

# Default environment variables
ENV REMOTE_IP=8282
ENV REMOTE_PORT=9001
ENV REMOTE_NAME=3000
ENV GATEWAY_NAME=
ENV DEVICE_NAME=
ENV DEVICE_PERIOD=



CMD ["sh" ,"/app/start.sh"]


#docker run -it --env REMOTE_IP=172.17.0.6 --env REMOTE_PORT=8080 --env REMOTE_NAME=main-gw --env GATEWAY_NAME=GW1 --env DEVICE_NAME=dev1 --env DEVICE_PERIOD=2000 sdci:zone