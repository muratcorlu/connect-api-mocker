/*
* Copyright 2016 Murat Çorlu <muratcorlu@gmail.com>
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
 * A connect middleware to serve a RESTful api by some json and js files
 *
 * @author Murat Çorlu <muratcorlu@gmail.com>
 */
var fs = require('fs');
var path = require('path');

function trimSlashes(text) {
  return text.replace(/\/$/, '').replace(/^\//, '');
}

/**
 * @param {string|object} urlRoot Base path for API url or full options object
 * @param {string} pathRoot Base path of API mock files. eg: ./mock/api
 * @param {integer} speedLimit Speed limit simulation by kb/sec metric. default is unlimited
 */
module.exports = function (urlRoot, pathRoot, speedLimit) {
  var config = {};

  if (typeof urlRoot == 'string') {
    config[urlRoot] = {
      target: pathRoot,
      speedLimit: speedLimit || 0
    };
  } else {
    config = urlRoot;
  }

  return function(req, res, next){
    for(var urlRoot in config) {
      var options = config[urlRoot];

      // trim leading slash from urlRoot
      urlRoot = trimSlashes(urlRoot);

      // if requested url is in our interest
      if (req.url.indexOf('/' + urlRoot) !== 0) {
        return next();
      }

      // Ignore querystrings
      var url = req.path;

      // trim trailing and leading slashes from url and remove urlRoot
      url = trimSlashes(url).replace(new RegExp('^' + urlRoot), '');

      // trim trailing and leading slashes from url again
      url = trimSlashes(url);

      var filePath = path.resolve(trimSlashes(options.target), url, req.method);

      fs.realpath(filePath + '.js', function (err, fullPath) {
        if (!err) {
          var customMiddleware = require(fullPath);
          return customMiddleware(req, res, next);
        }

        fs.realpath(filePath + '.json', function (jsonReadErr, jsonFullPath) {
          if (jsonReadErr) {
            return options.nextOnNotFound ?
              next() : res.status(404).send('Endpoint not found on mock files: ' + url);
          }

          fs.readFile(filePath + '.json', function(err, buf){
            if (err) {
              return next(err);
            }

            res.set('Content-Type', 'application/json');

            if (!speedLimit) {
              return res.end(buf);
            }

            setTimeout(function() {
              res.end(buf);
            }, buf.length / (speedLimit * 1024 / 8 ) * 1000);
          });
        });
      });
    }
  };
};
