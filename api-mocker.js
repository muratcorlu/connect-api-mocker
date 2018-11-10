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
    chalk.cyan(params.filePath)
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
 * Locate all possible options to match a file request, select the first one (most relevant)
 * @param {string} requestPath Requst path to API mock file.
 * @param {string[]} requestMethodFiles A list of files that match the request
 */
function findMatchingPath(requestPath, requestMethodFiles) {
  var pathParts = requestPath.split('/');
  var pathOptions = recurseLookup([pathParts.shift()], pathParts, []);

  var result = false;
  pathOptions.some(function (pathOption) {
    return requestMethodFiles.some(function (requestMethodFile) {
      if (fs.existsSync(path.join(pathOption.path, requestMethodFile))) {
        result = {
          path: path.resolve(path.join(pathOption.path, requestMethodFile)),
          params: pathOption.params
        };
        return true;
      }
    });
  });
  return result;
}
/**
 * Recursively loop through path to find all possible path matches including wildcards
 * @param {string[]} basePath rootPath to traverse down form
 * @param {string[]} lookupPath section of path to traverse
 * @param {object[]} existingParams list of params found on the basepath (key, value)
 */
function recurseLookup(basePath, lookupPath, existingParams) {
  var paths = [];
  var matchingFolders = findMatchingFolderOnLevel(basePath.join('/'), lookupPath[0], existingParams);
  if (lookupPath.length < 2) { return matchingFolders; }
  matchingFolders.forEach(function (folder) {
    paths = paths.concat(recurseLookup(folder.path.split('/'), lookupPath.slice(1), folder.params));
  });
  return paths;
}
/**
 * Find possible folder matches for current path
 * @param {string} parentPath path to current level
 * @param {string} testPath folder to locate on current level
 * @param {object[]} existingParams list of params found on the parentPath (key, value)
 */
function findMatchingFolderOnLevel(parentPath, testPath, existingParams) {
  var pathOptions = [];
  if (parentPath === false || !fs.existsSync(parentPath)) {
    return pathOptions;
  }
  if (fs.existsSync(path.join(parentPath, testPath))) {
    pathOptions.push({
      path: path.join(parentPath, testPath),
      params: existingParams.concat([])
    });
  }
  fs.readdirSync(parentPath)
    .filter(function (file) {
      return fs.lstatSync(path.join(parentPath, file)).isDirectory();
    })
    .filter(function (folder_name) {
      return folder_name.slice(0, 2) == '__' && folder_name.slice(-2) == '__';
    })
    .map(function (wildcardFolder) {
      return {
        param: wildcardFolder.slice(2, -2),
        folder: wildcardFolder
      };
    }).forEach(function (wildcardFolder) {
      var pathOption = {
        path: path.join(parentPath, wildcardFolder.folder),
        params: existingParams.concat({key: wildcardFolder.param, value: testPath})
      };
      pathOptions.push(pathOption);
    });
  return pathOptions;
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

    var returnForPath = function (filePath, requestParams) {
      if (filePath.endsWith('.js')) {
        logger({ req: req, filePath: filePath, fileType: 'js', config: config })
        delete require.cache[require.resolve(path.resolve(filePath))];
        var customMiddleware = require(path.resolve(filePath));
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

        logger({ req: req, filePath: filePath, fileType: fileType, config: config })
        var buf = fs.readFileSync(filePath);

        res.setHeader('Content-Type', 'application/' + fileType);

        return res.end(buf);
      }
    };
    var methodFileExtension = config.type || 'json';
    if (methodFileExtension == 'auto') {
      methodFileExtension = req.accepts(['json', 'xml']);
    }
    var jsMockFile = req.method + '.js';
    var staticMockFile = req.method + '.' + methodFileExtension;
    var wildcardJsMockFile = 'ANY.js';
    var wildcardStaticMockFile = 'ANY.' + methodFileExtension;

    var methodFiles = [jsMockFile, staticMockFile, wildcardJsMockFile, wildcardStaticMockFile];

    var matchedMethodFile = methodFiles.find(function (methodFile) {
      if (fs.existsSync(path.join(targetFullPath, methodFile))) {
        return true;
      }
      return false;
    });

    if (matchedMethodFile) {
      return returnForPath(path.resolve(path.join(targetFullPath, matchedMethodFile)));
    } else {
      var newTarget = findMatchingPath(targetPath, methodFiles);
      if (newTarget) {
        var requestParams = {};
        newTarget.params.forEach(function (param) {
          requestParams[param.key] = param.value;
        });
        return returnForPath(newTarget.path, requestParams);
      } else {
        return returnNotFound();
      }
    };
  };
};
