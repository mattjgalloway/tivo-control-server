"use strict";

var crypto = require('crypto')

crypto.randomBytes(16, function(error, buffer) {
  console.log("Client ID: " + buffer.toString('hex'));
});

crypto.randomBytes(32, function(error, buffer) {
  console.log("Client secret: " + buffer.toString('hex'));
});
