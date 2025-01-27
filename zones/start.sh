#!/bin/bash

# Start gateway in background
node gateway.js \
    --local_ip "0.0.0.0" \
    --local_port 8080 \
    --local_name $GATEWAY_NAME \
    --remote_ip $REMOTE_IP \
    --remote_port $REMOTE_PORT \
    --remote_name $REMOTE_NAME &

# Wait a bit for gateway to start
sleep 2

# Start device
node device.js \
    --local_ip "127.0.0.1" \
    --local_port 9090 \
    --local_name $DEVICE_NAME \
    --remote_ip "127.0.0.1" \
    --remote_port 8080 \
    --remote_name $GATEWAY_NAME \
    --send_period $DEVICE_PERIOD &

# Keep container running
wait

