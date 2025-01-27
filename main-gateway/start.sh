#!/bin/bash

# Start main gateway
node gateway.js \
    --local_ip "0.0.0.0" \
    --local_port 8080 \
    --local_name "main-gw" \
    --remote_ip $SERVER_IP \
    --remote_port $SERVER_PORT \
    --remote_name $SERVER_NAME


