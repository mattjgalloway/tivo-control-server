"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var app = express();

var config = require('./config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var auth = require('./routes/auth');
app.use('/', auth);

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
