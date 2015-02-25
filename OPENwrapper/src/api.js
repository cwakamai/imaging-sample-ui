//Copyright 2015 Akamai Technologies, Inc. All Rights Reserved.
// 
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//
//You may obtain a copy of the License at 
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

var https = require('https'),
  http = require('http'),
  url = require('url'),
  auth = require('./auth.js');

var _client_token = null,
  _client_secret = null,
  _access_token = null,
  _base_uri = null,
  _request = null;

var EdgeGrid = function(client_token, client_secret, access_token, base_uri) {

  if (client_token === undefined || client_token === null) {
    console.log("No client token");
    return false;
  } else if (client_secret === undefined || client_secret === null) {
    console.log("No client secret");
    return false;
  } else if (access_token === undefined || access_token === null) {
    console.log("No access token");
    return false;
  } else if (base_uri === undefined || base_uri === null) {
    console.log("No base uri");
    return false;
  }

  _client_token = client_token;
  _client_secret = client_secret;
  _access_token = access_token;
  _base_uri = base_uri;

  return this;
};

EdgeGrid.prototype.auth = function(request, callback) {

  _request = auth.generate_auth(request, _client_token, _client_secret, _access_token, _base_uri);

  if (callback && typeof callback == "function") {
    callback(this);
  }

  return this;
};


EdgeGrid.prototype.send = function(callback) { 

  var request = _request,
    data = "";

  var parts = url.parse(request.url);
  request.hostname = parts.hostname;
  request.port = parts.port || "80";

  var req = http.request(request, function(response) {
    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      if (callback && typeof callback == "function") {
        callback(data, response);
      }
    });
  });

  if (request.method == "POST" || request.method == "PUT") {
    req.write(request.body);
  }

  req.end();
};

module.exports = EdgeGrid;
