"use strict";

var sequelize = require('sequelize');
var sqlite3 = require('sqlite3');
var path = require('path');

var config = require('../config.json');

function SQLiteModel() {
  var db = new sequelize('oauthdb', null, null, {
    dialect: 'sqlite',
    storage: path.join(__dirname, '/../oauth.sqlite')
  });

  this.AccessToken = db.define('AccessToken', {
    id: {
      type: sequelize.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    accessToken: sequelize.STRING(256),
    accessTokenExpiresAt: sequelize.DATE,
    refreshToken: sequelize.STRING(256),
    refreshTokenExpiresAt: sequelize.DATE,
    scope: sequelize.STRING(128)
  });

  this.AuthorizationCode = db.define('AuthorizationCode', {
    id: {
      type: sequelize.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    code: sequelize.STRING(256),
    expiresAt: sequelize.DATE,
    redirectUri: sequelize.STRING(256),
    scope: sequelize.STRING(128)
  });

  db.sync({ force: false });
}

SQLiteModel.prototype.getAccessToken = function(bearerToken) {
  return this.AccessToken
    .findOne({
      where: { accessToken: bearerToken },
      attributes: ['accessToken', 'accessTokenExpiresAt', 'scope']
    })
    .then(function(accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON();
      token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
      token.client = { id: config.oauth.clientId };
      token.user = { username: config.oauth.username };
      return token;
    })
    .catch(function(err) {
      console.log("- getAccessToken error: " + err)
    });
};

SQLiteModel.prototype.getRefreshToken = function(bearerToken) {
  return this.AccessToken
    .findOne({
      where: { refreshToken: bearerToken },
      attributes: ['refreshToken', 'refreshTokenExpiresAt', 'scope']
    })
    .then(function(accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON();
      token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
      token.client = { id: config.oauth.clientId };
      token.user = { username: config.oauth.username };
      return token;
    })
    .catch(function(err) {
      console.log("- getAccessToken error: " + err);
    });
};

SQLiteModel.prototype.getClient = function(clientId, clientSecret) {
  if (clientId !== config.oauth.clientId || (clientSecret && clientSecret !== config.oauth.clientSecret)) {
    return false;
  }

  return {
    id: config.oauth.clientId,
    grants: ['password', 'authorization_code', 'refresh_token'],
    redirectUris: config.oauth.redirectUris
  };
};

SQLiteModel.prototype.getUser = function(username, password) {
  if (username !== config.oauth.username || password !== config.oauth.password) {
    return false;
  }

  return {
    username: config.oauth.username
  };
};

SQLiteModel.prototype.saveToken = function(token, client, user) {
  var data = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt
  };

  if (token.refreshToken) {
    data.refreshToken = token.refreshToken;
    data.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
  }

  return this.AccessToken
    .create(data)
    .then(function(results) {
      return {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        client: client,
        user: user
      };
    })
    .catch(function(err) {
      console.log("- saveToken error: " + err);
    });
};

SQLiteModel.prototype.revokeToken = function(token) {
  return this.AccessToken
    .findOne({
      where: { refreshToken: token.refreshToken },
    })
    .then(function(accessToken) {
      if (!accessToken) return false;
      return accessToken.destroy();
    })
    .then(function() {
      return true;
    })
    .catch(function(err) {
      console.log("- revokeToken error: " + err)
    });
};

SQLiteModel.prototype.getAuthorizationCode = function(authorizationCode) {
  return this.AuthorizationCode
    .findOne({
      where: { code: authorizationCode },
      attributes: ['code', 'expiresAt', 'scope']
    })
    .then(function(authorizationCode) {
      if (!authorizationCode) return false;
      var code = authorizationCode.toJSON();
      code.expiresAt = new Date(code.expiresAt);
      code.client = { id: config.oauth.clientId };
      code.user = { username: config.oauth.username };
      return code;
    })
    .catch(function(err) {
      console.log("- getAuthorizationCode error: " + err);
    });
};

SQLiteModel.prototype.saveAuthorizationCode = function(code, client, user) {
  var data = {
    code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri
  };

  return this.AuthorizationCode
    .create(data)
    .then(function(results) {
      return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: code.scope,
        client: client,
        user: user
      };
    })
    .catch(function(err) {
      console.log("- saveAuthorizationCode error: " + err);
    });
};

SQLiteModel.prototype.revokeAuthorizationCode = function(code) {
  return this.AuthorizationCode
    .findOne({
      where: { code: code.code },
    })
    .then(function(authorizationCode) {
      if (!authorizationCode) return false;
      return authorizationCode.destroy();
    })
    .then(function() {
      return true;
    })
    .catch(function(err) {
      console.log("- revokeAuthorizationCode error: " + err)
    });
};

module.exports = SQLiteModel;
