"use strict";

var auth = require('express').Router();
var oauthServer = require('express-oauth-server');
var oauthModel = require('../oauthmodel');

var config = require('../config.json');

auth.oauth = new oauthServer({
  model: new oauthModel()
});

auth.post('/auth', auth.oauth.token());

auth.get('/auth/authorize', function(req, res) {
  res.render('authorize', {
    clientId: req.query.client_id,
    redirectUri: req.query.redirect_uri
  });
});

auth.post('/auth/authorize', function(req, res, next) {
  if (req.body.username !== config.oauth.username || req.body.password !== config.oauth.password) {
    return res.render('authorize', {
      clientId: req.body.client_id,
      redirectUri: req.body.redirect_uri,
      invalidUser: true
    });
  }
  next();
}, auth.oauth.authorize({
  authenticateHandler: {
    handle: function(data) {
      return { username: config.oauth.username };
    }
  },
  allowEmptyState: true
}));

auth.use(auth.oauth.authenticate());

module.exports = auth;
