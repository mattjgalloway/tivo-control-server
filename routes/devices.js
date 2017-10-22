"use strict";

var devices = require('express').Router();
var results = require('../results');
var tivo = require('node-tivo');

var config = require('../config.json');
config.tivosById = {};
config.tivos.forEach(function(tivo, index) {
  tivo.id = Buffer.from(index + ":" + tivo.name).toString('base64');
  config.tivosById[tivo.id] = tivo;
});

devices.param('deviceId', function(req, res, next, value) {
  var device = config.tivosById[value];
  if (typeof device === 'undefined') {
    res.status(404).json(results.failure("Failed to find device."));
    return;
  }
  req.device = device;
  next();
});

devices.get('/devices', function(req, res) {
  res.json(config.tivos);
});

function sendCommandsToDevice(device, commands, callback) {
  tivo.sendCommands({ip: device.ip, port: device.port}, commands, callback);
}

function deviceIsOn(device, callback) {
  sendCommandsToDevice(device, [], function(responses) {
    callback(responses.length > 0);
  });
}

devices.get('/device/:deviceId/state', function(req, res) {
  var device = req.device;
  deviceIsOn(device, function(on) {
    res.json({ state: on });
  });
});

devices.post('/device/:deviceId/state', function(req, res) {
  var device = req.device;
  var newState = req.body.state ? true : false;
  deviceIsOn(device, function(on) {
    if (on === newState) {
      res.json(results.success());
      return;
    }

    var commands = null;
    if (on) {
        commands = ['IRCODE STANDBY'];
    } else {
        commands = ['IRCODE STANDBY', 'IRCODE STANDBY'];
    }
    sendCommandsToDevice(device, commands, function(responses) {
      res.json(results.success());
    });
  });
});

devices.get('/device/:deviceId/channel', function(req, res) {
  var device = req.device;
  sendCommandsToDevice(device, [], function(responses) {
    var lastResponse = responses.pop();
    if (typeof lastResponse === 'undefined') {
      res.status(404).json(results.failure("Failed to obtain channel."));
      return;
    }
    res.json({ channel: lastResponse.channel });
  });
});

devices.post('/device/:deviceId/channel', function(req, res) {
  var device = req.device;
  var channel = req.body.channel;
  if (typeof channel === 'undefined') {
    res.status(401).json(results.failure("Invalid channel."));
  }

  sendCommandsToDevice(device, ["SETCH " + channel], function(responses) {
    res.json(results.success());
  });
});

module.exports = devices;
