"use strict";

var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var app = express();

var config = require('./config.json');

app.use(express.json());

var devices = require('./routes/devices');
app.use('/', devices);

var ssl = config.ssl;
if (typeof ssl === 'undefined') {
  http.createServer(app).listen(config.port);
} else {
  var options = {
    key: fs.readFileSync(ssl.key),
    cert: fs.readFileSync(ssl.cert)
  };
  if (ssl.passphrase) {
    options.passphrase = ssl.passphrase;
  }
  https.createServer(options, app).listen(config.port);
}
