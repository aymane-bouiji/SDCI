#!/bin/bash

# Start server in background
node server.js --local_ip "0.0.0.0" --local_port $SERVER_PORT --local_name "srv" &

# Start three applications with different device targets
node application.js --remote_ip "127.0.0.1" --remote_port $SERVER_PORT --device_name "dev1" --send_period $APP_PERIOD &
node application.js --remote_ip "127.0.0.1" --remote_port $SERVER_PORT --device_name "dev2" --send_period $APP_PERIOD &
node application.js --remote_ip "127.0.0.1" --remote_port $SERVER_PORT --device_name "dev3" --send_period $APP_PERIOD & 

# Keep container running
wait

