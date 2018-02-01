/*
* Copyright 2016-2017 Murat Çorlu <muratcorlu@gmail.com>
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
var nodeUrl = require('url');
var bodyParser = require('body-parser');
var chalk = require('chalk');

function trimSlashes(text) {
  return text.replace(/\/$/, '').replace(/^\//, '');
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function defaultLogger(params) {
  console.log(
    chalk.bgYellow.black('api-mocker') + ' ' +
    chalk.green(params.req.method.toUpperCase()) + ' ' + 
    chalk.blue(params.req.originalUrl) + ' => ' +
    chalk.cyan(params.filePath + '.' + params.fileType)
  );
}

function logger(params) {
  if (params.config.verbose === true) {
    defaultLogger(params)
  } else if (typeof params.config.verbose === 'function') {
    params.config.verbose(params)
  }
}

/**
 * @param {string|object} urlRoot Base path for API url or full config object
 * @param {string|object} pathRoot Base path of API mock files. eg: ./mock/api or
 * config object for urlRoot
 */
module.exports = function (urlRoot, pathRoot) {
  return function(req, res, next){
    var config = {
      target: ''
    };
    var baseUrl;

    if (typeof urlRoot == 'string') {
      if (!pathRoot) {
        config.target = urlRoot;
        baseUrl = req.baseUrl;
      } else {
        baseUrl = urlRoot;
        if (typeof pathRoot == 'object') {
          config = pathRoot;
        } else {
          config.target = pathRoot;
        }
      }
    }

    if (typeof urlRoot == 'object') {
      config = urlRoot;
      baseUrl = req.baseUrl;
    }

    // trim leading slash from baseUrl
    baseUrl = trimSlashes(baseUrl);

    // if requested url is in our interest
    if (!req.baseUrl && req.url.indexOf('/' + baseUrl) !== 0) {
      return next();
    }

    // Ignore querystrings
    var url = nodeUrl.parse(req.url).pathname;

    // remove baseUrl
    url = url.replace(new RegExp('^(\/)?' + escapeRegExp(baseUrl)), '');

    // trim trailing and leading slashes from url again
    url = trimSlashes(url);

    var targetPath = trimSlashes(config.target) + '/' + url;
    var targetFullPath = path.resolve(targetPath);

    var returnNotFound =  function () {
      if (config.nextOnNotFound) {
        return next();
      }

      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end('Endpoint not found on mock files: ' + url);
    };

    var returnForPath = function (targetFolder, requestParams) {
      var filePath = path.resolve(targetFolder, req.method);

      if (fs.existsSync(filePath + '.js')) {
        logger({ req: req, filePath: filePath, fileType: 'js', config: config })
        delete require.cache[require.resolve(filePath + '.js')];
        var customMiddleware = require(filePath + '.js');
        if (requestParams) {
          req.params = requestParams;
        }
        bodyParser.json()(req, res, function () {
          customMiddleware(req, res, next);
        });
        return
      } else {
        var fileType = config.type || 'json';

        if (fileType == 'auto') {
          fileType = req.accepts(['json', 'xml']);
        };

        if (fs.existsSync(filePath + '.' + fileType)) {
          logger({ req: req, filePath: filePath, fileType: fileType, config: config })
          var buf = fs.readFileSync(filePath + '.' + fileType);

          res.setHeader('Content-Type', 'application/' + fileType);

          return res.end(buf);

        } else {
          return returnNotFound();
        }
      }
    };

    if (fs.existsSync(targetFullPath)) {
      return returnForPath(targetFullPath);
    } else {
      var requestParams = {};

      var newTarget = targetPath.split('/').reduce(function (currentFolder, nextFolder, index) {
        if (currentFolder === false) {
          return '';
        }
        // First iteration
        if (currentFolder === '') {
          return nextFolder;
        }

        var pathToCheck = currentFolder + '/' + nextFolder;
        if (fs.existsSync(pathToCheck)) {
          return pathToCheck
        } else {
          if (!fs.existsSync(currentFolder)) {
            return false;
          }

          var folders = fs.readdirSync(currentFolder)
            .filter(function (file) {
              return fs.lstatSync(path.join(currentFolder, file)).isDirectory();
            })
            .filter(function (folder_name) {
              return folder_name.slice(0, 2) == '__' && folder_name.slice(-2) == '__';
            })
            .map(function (wildcardFolder) {
              return {
                param: wildcardFolder.slice(2, -2),
                folder: wildcardFolder
              };
            });

          if (folders.length > 0) {
            requestParams[folders[0].param] = nextFolder;
            return currentFolder + '/' + folders[0].folder;
          } else {
            return false;
          }
        }
      }, '');

      if (newTarget) {
        return returnForPath(newTarget, requestParams);
      } else {
        return returnNotFound();
      }
    };
  };
};
