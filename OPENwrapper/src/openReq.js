// Copyright 2015 Akamai Technologies, Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var EdgeGrid = require('./api.js'),
  express = require('express'),
  url = require('url'),
  logger = require('morgan'),
  http = require('http'),
  https = require('https'),
  HttpStatus = require('http-status-codes'),
  fs = require('fs'),
  args = require('nomnom')
  .option('config', {
      abbr: 'c',
      default: './OPENwrapper/src/conf.json',
      help: 'JSON config file to use'
   })
  .option('port',{
    abbr: 'p',
    default: 8421,
    help: 'The port you want the server to run on'
  })
  .option('openEnabled',{
    abbr: 'o',
    default: 'y',
    help: 'Do you want to enable OPEN authentication y/n'
  }).nom(),
  config = require(fs.realpathSync(args.config, './'));

if (config.hasOwnProperty('client_token')){
  var openConf = config;
  console.log("\n***\nMISSING PURGE CREDENTIALS! Operating in legacy mode.\n***");
} else {
  var openConf = config.openConf,
    purgeConf = config.purgeConf;
}

var logStream = fs.createWriteStream("imna.log", {flags:'a'});
logger.token('config', function () {
  return openConf.toString();
});

if (!openConf.client_token || !openConf.client_secret || !openConf.access_token || !openConf.base_uri) {
  throw "CONFIG ERROR: Improper or missing config values";
}

function sendRequestToAPI(apiRequest, apiResponse, next) {
  if (apiRequest.path.indexOf('/imaging') !== 0){
    next();
    return;
  }

  var
    client_token = openConf.client_token,
    client_secret = openConf.client_secret,
    access_token = openConf.access_token,
    base_uri = openConf.base_uri;

    if (base_uri.substr(base_uri.length - 1) == "/")
      base_uri = base_uri.substr(0,base_uri.length - 1);

    path = apiRequest.originalUrl,
    lunaToken = apiRequest.header("luna-token"),
    data = apiRequest.rawBody,
    method = apiRequest.method,
    contentType = apiRequest.header("Content-Type") || "application/json";

  var eg = new EdgeGrid(client_token, client_secret, access_token, base_uri);

  if (method === "OPTIONS") {
    apiResponse.setHeader("Access-Control-Allow-Origin", "*");
    apiResponse.setHeader("Access-Control-Allow-Headers", "Luna-Token, Content-Length, Content-Type, X-Codingpedia, x-requested-with");
    apiResponse.setHeader("Access-Control-Expose-Headers", "content-length");
    apiResponse.setHeader("Access-Control-Expose-Methods", "GET, PUT, POST, OPTIONS");
    apiResponse.send(HttpStatus.OK);
  } else {
    if (args.openEnabled !== 'n'){
      if (lunaToken===undefined) {
        eg.auth({
          "path": path,
          "method": method,
          "headers":
          {
            "Content-Type": contentType
          },
          "body": data
        });
      } else {
        eg.auth({
          "path": path,
          "method": method,
          "headers":
          {
            "Luna-Token": lunaToken,
            "Content-Type": contentType
          },
          "body": data
        });
      }

      eg.send(function (data, response) {
        console.log("RESPONSE RECEIVED:");
        console.log("MIME Type:"+response.headers['content-type']+"\n");
        apiResponse.set('Content-Type', response.headers['content-type']);
        apiResponse.setHeader("Access-Control-Allow-Origin", "*");

        try {
          apiResponse.status(response.statusCode).send(data);
        } catch (e) {
          apiResponse.set('content-type', 'application/problem+json');
          //console.log(e);
          apiResponse.status(response.statusCode).send(data);
        }
      });
    } else {
      var request_url = url.parse(base_uri + path, true);

      var post_options = {
        host: request_url.hostname,
        port: '80',
        path: path,
        method: method,
        headers: {
            'Content-Type': contentType,
            'Content-Length': data.length
          }
      };

      // Set up the request
      var secure_post_req = https.request(post_options, 
        function(res){
          res.setEncoding('utf8');

          if (res.statusCode >= 400){
            var post_req = http.request(post_options, function(http_response) {
                http_response.setEncoding('utf8');
                http_response.on('data', function (http_chunk) {
                    console.log('Response: ' + http_chunk);
                });
            });
            post_req.write(data);
            post_req.end();
          } else {
            res.on('data', function(chunk){
              console.log('Response: ' + chunk);
            });
            secure_post_req.write(data);
            secure_post_req.end();
          }

        });
    }
  }
}

function sendPurgeRequest(apiRequest, apiResponse, next) {
  if (apiRequest.path.indexOf('/ccu') !== 0) {
    next();
    return;
  }
    // Deal with ccu purge
    var
      access_token = purgeConf.access_token,
      client_token = purgeConf.client_token,
      client_secret = purgeConf.secret,
      base_uri = purgeConf.host;

    if (base_uri.substr(base_uri.length - 1) == "/")
      base_uri = base_uri.substr(0,base_uri.length - 1)

    path = apiRequest.originalUrl,
    method = apiRequest.method,
    data = apiRequest.rawBody;

    var eg = new EdgeGrid(client_token, client_secret, access_token, base_uri);

    eg.auth({
      "path": path,
      "method": method,
      "headers":
      {
        "Content-Type": 'application/json'
      },
      "body": data
    });

    eg.send(function (data, response) {
      console.log("PURGE RESPONSE RECEIVED");
      console.log("response: " + response.data);
      apiResponse.setHeader("Access-Control-Allow-Origin", "*");
      apiResponse.setHeader('Content-Type', response.headers['content-type']);

      try {
        apiResponse.status(response.statusCode).send(data);
      } catch (e) {
        apiResponse.set('content-type', 'application/problem+json');
        apiResponse.status(response.statusCode).send(data);
      }
    });
}

var server = express();
server.set('port', args.port);

server.use(function(req, res, next) {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });

  req.on('end', function() {
    next();
  });
});

function returnCreds(req, res, next) {
  if (req.path.indexOf('/creds') !== 0) {
    next();
    return;
  }
  res.send(!!purgeConf);
}

server.use(returnCreds);
server.use(sendRequestToAPI);
server.use(sendPurgeRequest);
server.use(express.static(__dirname + '/../webapp'));
server.use(logger(
    {stream: 
      {write: function(str) {
          logStream.write(str);
          console.log(str);
      }
    }}
  )
);

server.listen(args.port, function() {
  console.log('%s is listening at port %s', server.name, args.port);
  if (args.openEnabled == "n")
    console.log("OPEN authentication is not enabled");
});
