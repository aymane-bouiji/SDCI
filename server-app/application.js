/**
 *  Author: Samir MEDJIAH medjiah@laas.fr
 *  File : application.js
 *  Version : 0.2.0
 */

var express = require('express')
var app = express()
var request = require('request');

var argv = require('yargs').argv;
// --remote_ip
// --remote_port
// --device_name
// --send_period 

var REMOTE_ENDPOINT = {IP : argv.remote_ip, PORT : argv.remote_port};
var DATA_PERIOD = argv.send_period;
var TARGET_DEVICE = argv.device_name;

function retrieveData() {
    request(
        {
            method: 'GET', 
            uri: 'http://' + REMOTE_ENDPOINT.IP + ':' + REMOTE_ENDPOINT.PORT + '/device/'+ TARGET_DEVICE + '/latest',
        }, 
        function(error, response, respBody) {
            if (error) {
                console.error('Error retrieving data:', error);
                return;
            }
            
            if (response.statusCode !== 200) {
                console.error('Received status code:', response.statusCode);
                return;
            }

            try {
                const data = JSON.parse(respBody);
                console.log('Retrieved data:', data);
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        }
    ); 
}

// Verify required arguments
if (!argv.remote_ip || !argv.remote_port || !argv.device_name || !argv.send_period) {
    console.error('Missing required arguments. Usage:');
    console.error('node application.js --remote_ip <ip> --remote_port <port> --device_name <name> --send_period <period>');
    process.exit(1);
}

// Start periodic data retrieval
console.log(`Starting data retrieval for device ${TARGET_DEVICE} every ${DATA_PERIOD}ms`);
setInterval(retrieveData, DATA_PERIOD);

// Optional: Start express server if needed
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Application listening on port ${PORT}`);
});

