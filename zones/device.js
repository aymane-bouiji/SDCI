/**
 *  Author: Samir MEDJIAH medjiah@laas.fr
 *  File : device.js
 *  Version : 0.2.0
 */

var express = require('express')
var app = express()
var request = require('request');

var argv = require('yargs').argv;

// Validate required command line arguments
const requiredArgs = [
    'local_ip',
    'local_port',
    'local_name',
    'remote_ip',
    'remote_port',
    'remote_name',
    'send_period'
];

// Check for missing arguments
const missingArgs = requiredArgs.filter(arg => !argv[arg]);
if (missingArgs.length > 0) {
    console.error('Missing required arguments:', missingArgs.join(', '));
    process.exit(1);
}

var LOCAL_ENDPOINT = {IP : argv.local_ip, PORT : argv.local_port, NAME : argv.local_name};
var REMOTE_ENDPOINT = {IP : argv.remote_ip, PORT : argv.remote_port, NAME : argv.remote_name};

var DATA_PERIOD = argv.send_period;

function doPOST(uri, body, onResponse) {
    request(
        {
            method: 'POST', 
            uri: uri, 
            json: body,
            timeout: 5000 // 5 second timeout
        }, 
        function(error, response, respBody) {
            if (error) {
                console.error('Request error:', error);
                onResponse(error, response, respBody);
                return;
            }
            onResponse(null, response, respBody);
        }
    ); 
}

function register() {
    console.log(`Registering device ${LOCAL_ENDPOINT.NAME} with gateway ${REMOTE_ENDPOINT.NAME}`);
    doPOST(
        'http://' + REMOTE_ENDPOINT.IP + ':' + REMOTE_ENDPOINT.PORT + '/devices/register', 
        {
            Name : LOCAL_ENDPOINT.NAME, 
            PoC : 'http://' + LOCAL_ENDPOINT.IP + ':' + LOCAL_ENDPOINT.PORT, 
        },
        function(error, response, respBody) {
            if (error) {
                console.error('Registration failed:', error);
                // Retry registration after 5 seconds
                setTimeout(register, 5000);
                return;
            }
            if (response && response.statusCode === 201) {
                console.log('Device registered successfully');
            } else {
                console.error('Registration failed with status:', response ? response.statusCode : 'unknown');
                // Retry registration after 5 seconds
                setTimeout(register, 5000);
            }
        }
    );
}

var dataItem = 0;
function sendData() {
    doPOST(
        'http://' + REMOTE_ENDPOINT.IP + ':' + REMOTE_ENDPOINT.PORT + '/device/'+ LOCAL_ENDPOINT.NAME + '/data', 
        {
            Name : LOCAL_ENDPOINT.NAME, 
            Data : dataItem++,
            CreationTime : Date.now(),
            ReceptionTime : null
        },
        function(error, response, respBody) {
            if (error) {
                console.error('Failed to send data:', error);
                return;
            }
            if (response && response.statusCode === 201) {
                console.log(`Data sent successfully: ${dataItem-1}`);
            } else {
                console.error('Failed to send data. Status:', response ? response.statusCode : 'unknown');
            }
        }
    );
}

// Initialize express server for potential future use
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const serverPort = LOCAL_ENDPOINT.PORT;
app.listen(serverPort, () => {
    console.log(`Device ${LOCAL_ENDPOINT.NAME} listening on port ${serverPort}`);
    
    // Start device operations after server is ready
    register();
    setInterval(sendData, DATA_PERIOD);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    // Add any cleanup code here if needed
    process.exit(0);
});
