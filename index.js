const fs = require('fs');
const path = require('path');
const nodeUrl = require('url');
const bodyParser = require('body-parser');
const chalk = require('chalk');

function trimSlashes(text) {
  return text.replace(/\/$/, '').replace(/^\//, '');
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function defaultLogger(params) {
  console.log(
    `${chalk.bgYellow.black('api-mocker')} ${
      chalk.green(params.req.method.toUpperCase())} ${
      chalk.blue(params.req.originalUrl)} => ${
      chalk.cyan(params.filePath)}`
  );
}

function logger(params) {
  if (params.config.verbose === true) {
    defaultLogger(params);
  } else if (typeof params.config.verbose === 'function') {
    params.config.verbose(params);
  }
}

/**
 * Find possible folder matches for current path
 * @param {string} parentPath path to current level
 * @param {string} testPath folder to locate on current level
 * @param {object[]} existingParams list of params found on the parentPath (key, value)
 */
function findMatchingFolderOnLevel(parentPath, testPath, existingParams) {
  const pathOptions = [];
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
    .filter(file => fs.lstatSync(path.join(parentPath, file)).isDirectory())
    .filter(folder_name => folder_name.slice(0, 2) === '__' && folder_name.slice(-2) === '__')
    .map(wildcardFolder => ({
      param: wildcardFolder.slice(2, -2),
      folder: wildcardFolder
    }))
    .forEach((wildcardFolder) => {
      const pathOption = {
        path: path.join(parentPath, wildcardFolder.folder),
        params: existingParams.concat({ key: wildcardFolder.param, value: testPath })
      };
      pathOptions.push(pathOption);
    });
  return pathOptions;
}

/**
 * Recursively loop through path to find all possible path matches including wildcards
 * @param {string[]} basePath rootPath to traverse down form
 * @param {string[]} lookupPath section of path to traverse
 * @param {object[]} existingParams list of params found on the basepath (key, value)
 */
function recurseLookup(basePath, lookupPath, existingParams) {
  let paths = [];
  const matchingFolders = findMatchingFolderOnLevel(basePath.join('/'), lookupPath[0], existingParams);
  if (lookupPath.length < 2) { return matchingFolders; }
  matchingFolders.forEach((folder) => {
    paths = paths.concat(recurseLookup(folder.path.split('/'), lookupPath.slice(1), folder.params));
  });
  return paths;
}

/**
 * Locate all possible options to match a file request, select the first one (most relevant)
 * @param {string} requestPath Requst path to API mock file.
 * @param {string[]} requestMethodFiles A list of files that match the request
 */
function findMatchingPath(requestPath, requestMethodFiles) {
  const pathParts = requestPath.split('/');
  const pathOptions = recurseLookup([pathParts.shift()], pathParts, []);

  let result = false;
  pathOptions.some(pathOption => requestMethodFiles.some((requestMethodFile) => {
    if (fs.existsSync(path.join(pathOption.path, requestMethodFile))) {
      result = {
        path: path.resolve(path.join(pathOption.path, requestMethodFile)),
        params: pathOption.params
      };
      return true;
    }

    return false;
  }));
  return result;
}

/**
 * @param {string|object} urlRoot Base path for API url or full config object
 * @param {string|object} pathRoot Base path of API mock files. eg: ./mock/api or
 * config object for urlRoot
 */
module.exports = function (urlRoot, pathRoot) {
  return function (req, res, next) {
    let config = {
      target: ''
    };
    let baseUrl;

    if (typeof urlRoot === 'string') {
      if (!pathRoot) {
        config.target = urlRoot;
        baseUrl = req.baseUrl;
      } else {
        baseUrl = urlRoot;
        if (typeof pathRoot === 'object') {
          config = pathRoot;
        } else {
          config.target = pathRoot;
        }
      }
    }

    if (typeof urlRoot === 'object') {
      config = urlRoot;
      baseUrl = req.baseUrl;
    }

    // trim leading slash from baseUrl
    baseUrl = trimSlashes(baseUrl);

    // if requested url is in our interest
    if (!req.baseUrl && req.url.indexOf(`/${baseUrl}`) !== 0) {
      return next();
    }

    // Ignore querystrings
    let url = nodeUrl.parse(req.url).pathname;

    // remove baseUrl
    url = url.replace(new RegExp(`^(\/)?${escapeRegExp(baseUrl)}`), '');

    // trim trailing and leading slashes from url again
    url = trimSlashes(url);

    const targetPath = `${trimSlashes(config.target)}/${url}`;
    const targetFullPath = path.resolve(targetPath);

    const returnNotFound = function () {
      if (config.nextOnNotFound) {
        return next();
      }

      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end(`Endpoint not found on mock files: ${url}`);
    };

    const returnForPath = function (filePath, requestParams) {
      if (filePath.endsWith('.js')) {
        logger({
          req, filePath, fileType: 'js', config
        });
        delete require.cache[require.resolve(path.resolve(filePath))];
        let customMiddleware = require(path.resolve(filePath));
        if (requestParams) {
          req.params = requestParams;
        }

        const executeMiddleware = (request, response) => {
          if (typeof customMiddleware === 'function') {
            customMiddleware = [customMiddleware];
          }
          // flatten middlewares
          customMiddleware = [].concat(...customMiddleware);

          customMiddleware.reduce((chain, middleware) => chain.then(
            () => new Promise(resolve => middleware(request, response, resolve))
          ), Promise.resolve()).then(next);
        };

        if (config.bodyParser === false) {
          executeMiddleware(req, res);
        } else {
          const bodyParserType = (config.bodyParser && config.bodyParser.type) || 'json';
          const bodyParserOptions = (config.bodyParser && config.bodyParser.options) || {};

          bodyParser[bodyParserType](bodyParserOptions)(req, res, () => executeMiddleware(req, res));
        }
      } else {
        let fileType = config.type || 'json';

        if (fileType === 'auto') {
          fileType = req.accepts(['json', 'xml']);
        }

        logger({
          req, filePath, fileType, config
        });
        const buf = fs.readFileSync(filePath);

        res.setHeader('Content-Type', `application/${fileType}`);

        return res.end(buf);
      }
    };
    let methodFileExtension = config.type || 'json';
    if (methodFileExtension === 'auto') {
      methodFileExtension = req.accepts(['json', 'xml']);
    }
    const jsMockFile = `${req.method}.js`;
    const staticMockFile = `${req.method}.${methodFileExtension}`;
    const wildcardJsMockFile = 'ANY.js';
    const wildcardStaticMockFile = `ANY.${methodFileExtension}`;

    const methodFiles = [jsMockFile, staticMockFile, wildcardJsMockFile, wildcardStaticMockFile];

    const matchedMethodFile = methodFiles.find(methodFile => fs.existsSync(path.join(targetFullPath, methodFile)));

    if (matchedMethodFile) {
      return returnForPath(path.resolve(path.join(targetFullPath, matchedMethodFile)));
    }
    const newTarget = findMatchingPath(targetPath, methodFiles);
    if (newTarget) {
      const requestParams = {};
      newTarget.params.forEach((param) => {
        requestParams[param.key] = param.value;
      });
      return returnForPath(newTarget.path, requestParams);
    }
    return returnNotFound();
  };
};
