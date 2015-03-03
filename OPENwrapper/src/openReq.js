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


var logStream = fs.createWriteStream("imna.log", {flags:'a'});
logger.token('config', function () {
  return config.toString();
});

if (config.client_token === null || config.client_secret === null ||
  config.access_token === null || config.base_uri === null) {
  console.log("CONFIG ERROR: Missing config values");
}

function sendRequestToAPI(apiRequest, apiResponse, next) {

  if (apiRequest.path.indexOf('/imaging') !== 0){
    next();
    return;
  }

  var 
    client_token = config.client_token,
    client_secret = config.client_secret,
    access_token = config.access_token,
    base_uri = config.base_uri;

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
    apiResponse.setHeader("Access-Control-Expose-Methods", "GET, POST, OPTIONS");
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

        apiResponse.set('Content-Type', response.headers['content-type']);
        console.log("RESPONSE RECEIVED:");
        console.log("MIME Type:"+response.headers['content-type']+"\n");
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
      var secure_post_req = https.request(post_options, function(res){
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

server.use(sendRequestToAPI);
server.use(express.static(__dirname + '/../webapp'));
server.use(logger(
    {stream: { write: function(str) {
          logStream.write(str);
          console.log(str);
    }}}
  )
);

server.listen(args.port, function() {
  console.log('%s is listening at port %s', server.name, args.port);
  if (args.openEnabled == "n")
    console.log("OPEN authentication is not enabled");
});
