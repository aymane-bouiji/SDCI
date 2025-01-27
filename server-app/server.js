/**
 *  Author: Samir MEDJIAH medjiah@laas.fr
 *  File : server.js
 *  Version : 0.2.1
 */

const express = require('express');
const si = require('systeminformation');
const yargs = require('yargs');

const app = express();
app.use(express.json());

const argv = yargs.argv;

// Define local endpoint from CLI arguments
const LOCAL_ENDPOINT = { IP: argv.local_ip, PORT: argv.local_port, NAME: argv.local_name };

// Response codes
const E_OK = 200;
const E_CREATED = 201;
const E_FORBIDDEN = 403;
const E_NOT_FOUND = 404;
const E_ALREADY_EXIST = 500;

// In-memory database
const db = {
    devices: new Map(),
    data: new Map(),
    gateways: new Map()
};

// Utility functions
function addNewDevice(dev) {
    if (!db.devices.has(dev.Name)) {
        db.devices.set(dev.Name, dev);
        db.data.set(dev.Name, []);
        return 0;
    }
    return -1;
}

function addNewGateway(gw) {
    if (!db.gateways.has(gw.Name)) {
        db.gateways.set(gw.Name, gw);
        return 0;
    }
    return -1;
}

function removeDevice(dev) {
    if (db.devices.has(dev.Name)) {
        db.devices.delete(dev.Name);
        db.data.delete(dev.Name);
    }
}

function removeGateway(gw) {
    if (db.gateways.has(gw.Name)) {
        db.gateways.delete(gw.Name);
    }
}

function addDeviceData(devName, data) {
    if (db.devices.has(devName)) {
        data.ReceptionTime = Date.now();
        db.data.get(devName).push(data);
        return 0;
    }
    return -1;
}

// API Endpoints
app.get('/devices', (req, res) => {
    const devices = Array.from(db.devices.values());
    res.status(E_OK).send(devices);
});

app.get('/device/:dev', (req, res) => {
    const devName = req.params.dev;
    const device = db.devices.get(devName);
    if (device) {
        res.status(E_OK).send(device);
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.post('/device/:dev/data', (req, res) => {
    const devName = req.params.dev;
    const result = addDeviceData(devName, req.body);
    if (result === 0) {
        res.sendStatus(E_CREATED);
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.get('/device/:dev/data', (req, res) => {
    const devName = req.params.dev;
    const device = db.devices.get(devName);
    if (device) {
        const data = db.data.get(devName) || [];
        res.status(E_OK).send(data);
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.get('/device/:dev/latest', (req, res) => {
    const devName = req.params.dev;
    const device = db.devices.get(devName);
    if (device) {
        const data = db.data.get(devName) || [];
        if (data.length > 0) {
            res.status(E_OK).send(data[data.length - 1]);
        } else {
            res.sendStatus(E_NOT_FOUND);
        }
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.post('/devices/register', (req, res) => {
    const result = addNewDevice(req.body);
    if (result === 0) {
        res.sendStatus(E_CREATED);
    } else {
        res.sendStatus(E_ALREADY_EXIST);
    }
});

app.get('/gateways', (req, res) => {
    const gateways = Array.from(db.gateways.values());
    res.status(E_OK).send(gateways);
});

app.get('/gateway/:gw', (req, res) => {
    const gwName = req.params.gw;
    const gateway = db.gateways.get(gwName);
    if (gateway) {
        res.status(E_OK).send(gateway);
    } else {
        res.sendStatus(E_NOT_FOUND);
    }
});

app.post('/gateways/register', (req, res) => {
    const result = addNewGateway(req.body);
    if (result === 0) {
        res.sendStatus(E_CREATED);
    } else {
        res.sendStatus(E_ALREADY_EXIST);
    }
});

app.get('/ping', (req, res) => {
    res.status(E_OK).send({ pong: Date.now() });
});

app.get('/health', async (req, res) => {
    try {
        const load = await si.currentLoad();
        res.status(E_OK).send(load);
    } catch (err) {
        console.error(err);
        res.sendStatus(E_FORBIDDEN);
    }
});

app.listen(LOCAL_ENDPOINT.PORT, () => {
    console.log(`${LOCAL_ENDPOINT.NAME} listening on : ${LOCAL_ENDPOINT.PORT}`);
});
