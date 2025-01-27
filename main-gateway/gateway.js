/**
 *  Author: Samir MEDJIAH medjiah@laas.fr
 *  File : gateway.js
 *  Version : 0.2.1
 */

const express = require('express');
const app = express();
app.use(express.json()); // For parsing application/json

const request = require('request');
const si = require('systeminformation');
const argv = require('yargs').argv;

// Define local and remote endpoint configurations
const LOCAL_ENDPOINT = { IP: argv.local_ip, PORT: argv.local_port, NAME: argv.local_name };
const REMOTE_ENDPOINT = { IP: argv.remote_ip, PORT: argv.remote_port, NAME: argv.remote_name };

// HTTP status codes
const E_OK = 200;
const E_CREATED = 201;
const E_FORBIDDEN = 403;
const E_NOT_FOUND = 404;
const E_ALREADY_EXIST = 500;

// In-memory database to store gateways
const db = {
    gateways: new Map()
};

// Functions to manage gateway registrations
function addNewGateway(gw) {
    if (!db.gateways.has(gw.Name)) {
        db.gateways.set(gw.Name, gw);
        return 0;
    }
    return -1;
}

function removeGateway(gw) {
    if (db.gateways.has(gw.Name)) {
        db.gateways.delete(gw.Name);
    }
}

// Function to perform HTTP POST requests
function doPOST(uri, body, onResponse) {
    request({ method: 'POST', uri, json: body }, onResponse);
}

// Register the gateway with the remote endpoint
function register() {
    doPOST(
        `http://${REMOTE_ENDPOINT.IP}:${REMOTE_ENDPOINT.PORT}/gateways/register`,
        { Name: LOCAL_ENDPOINT.NAME, PoC: `http://${LOCAL_ENDPOINT.IP}:${LOCAL_ENDPOINT.PORT}` },
        (error, response, respBody) => {
            if (error) {
                console.error('Registration failed:', error);
            } else {
                console.log('Registration response:', respBody);
            }
        }
    );
}

// Routes
app.post('/gateways/register', (req, res) => {
    console.log('Received gateway registration:', req.body);
    const result = addNewGateway(req.body);
    if (result === 0) {
        res.sendStatus(E_CREATED);
    } else {
        res.sendStatus(E_ALREADY_EXIST);
    }
});

app.post('/devices/register', (req, res) => {
    console.log('Forwarding device registration:', req.body);
    doPOST(
        `http://${REMOTE_ENDPOINT.IP}:${REMOTE_ENDPOINT.PORT}/devices/register`,
        req.body,
        (error, response, respBody) => {
            if (error) {
                console.error('Device registration failed:', error);
                res.sendStatus(E_FORBIDDEN);
            } else {
                console.log('Device registration response:', respBody);
                res.sendStatus(E_OK);
            }
        }
    );
});

app.post('/device/:dev/data', (req, res) => {
    console.log(`Forwarding data for device ${req.params.dev}:`, req.body);
    doPOST(
        `http://${REMOTE_ENDPOINT.IP}:${REMOTE_ENDPOINT.PORT}/device/${req.params.dev}/data`,
        req.body,
        (error, response, respBody) => {
            if (error) {
                console.error('Data forwarding failed:', error);
                res.sendStatus(E_FORBIDDEN);
            } else {
                console.log('Data forwarding response:', respBody);
                res.sendStatus(E_OK);
            }
        }
    );
});

app.get('/gateways', (req, res) => {
    console.log('Fetching all gateways');
    const gateways = Array.from(db.gateways.values());
    res.status(E_OK).json(gateways);
});

app.get('/gateway/:gw', (req, res) => {
    console.log(`Fetching details for gateway ${req.params.gw}`);
    const gateway = db.gateways.get(req.params.gw);
    if (gateway) {
        res.status(E_OK).json(gateway);
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.get('/ping', (req, res) => {
    console.log('Received ping request');
    res.status(E_OK).json({ pong: Date.now() });
});

app.get('/health', (req, res) => {
    console.log('Fetching system health');
    si.currentLoad()
        .then((load) => res.status(E_OK).json(load))
        .catch((err) => {
            console.error('System health fetch failed:', err);
            res.sendStatus(E_FORBIDDEN);
        });
});

// Start the server
register();
app.listen(LOCAL_ENDPOINT.PORT, () => {
    console.log(`${LOCAL_ENDPOINT.NAME} listening on: ${LOCAL_ENDPOINT.PORT}`);
});
