connect-api-mocker
==================

[![Build Status](https://travis-ci.org/muratcorlu/connect-api-mocker.svg?branch=master)](https://travis-ci.org/muratcorlu/connect-api-mocker) [![npm version](https://badge.fury.io/js/connect-api-mocker.svg)](https://www.npmjs.com/package/connect-api-mocker) [![codecov](https://codecov.io/gh/muratcorlu/connect-api-mocker/branch/master/graph/badge.svg)](https://codecov.io/gh/muratcorlu/connect-api-mocker) [![Greenkeeper badge](https://badges.greenkeeper.io/muratcorlu/connect-api-mocker.svg)](https://greenkeeper.io/) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

`connect-api-mocker` is a [connect.js](https://github.com/senchalabs/connect) middleware that fakes REST API server with filesystem. It will be helpful when you try to test your application without the actual REST API server.

It works with a wide range of servers: [connect][], [express][], [browser-sync][], [lite-server][], [webpack-dev-server][]. Also it can be used as a command line tool with the help of [cli-api-mocker](https://github.com/muratcorlu/cli-api-mocker).

Detailed article: [https://medium.com/@muratcorlu/mocking-rest-endpoints-in-web-apps-easy-way-d4cd0e9db000](https://medium.com/@muratcorlu/mocking-rest-endpoints-in-web-apps-easy-way-d4cd0e9db000)

A presentation at AmsterdamJS'18 conference: [https://www.youtube.com/watch?v=yF_8O4l-Ybc](https://www.youtube.com/watch?v=yF_8O4l-Ybc)

Türkçe sunum için: https://www.youtube.com/watch?v=cVL8sesauCU

## Installation

```
npm install connect-api-mocker --save-dev
```

## Usage

### Using with [Connect][]

```js
var http = require('http');
var connect = require('connect');
var apiMocker = require('connect-api-mocker');

var app = connect();

app.use('/api', apiMocker('mocks/api'));

http.createServer(app).listen(8080);
```

### Using with [Express][]

```js
var express = require('express');
var apiMocker = require('connect-api-mocker');

var app = express();

app.use('/api', apiMocker('mocks/api'));

app.listen(8080);
```

### Using with [BrowserSync][]

```js
var browserSync = require('browser-sync').create();
var apiMocker = require('connect-api-mocker');

var restMock = apiMocker('/api', 'mocks/api');

browserSync.init({
  server: {
    baseDir: './',
    middleware: [
      restMock,
    ],
  },
  port: 8080,
});
```

### Using with [lite-server][]

`bs-config.js` file:

```js
var apiMocker = require('connect-api-mocker');

var restMock = apiMocker('/api', 'mocks/api');

module.exports = {
  server: {
    middleware: {
      // Start from key `10` in order to NOT overwrite the default 2 middleware provided
      // by `lite-server` or any future ones that might be added.
      10: restMock,
    },
  },
  port: 8080,
};
```

### Using with Grunt

You can use it with [Grunt](http://gruntjs.com). After you install [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) add api-mocker middleware to your grunt config. The `mocks/api` folder will be served as REST API at `/api`.

```js

module.exports = function(grunt) {
  var apiMocker = require('connect-api-mocker');

  grunt.loadNpmTasks('grunt-contrib-connect');  // Connect - Development server

  // Project configuration.
  grunt.initConfig({

    // Development server
    connect: {
      server: {
        options: {
          base: './build',
          port: 9001,
          middleware: function(connect, options) {

            var middlewares = [];

            // mock/rest directory will be mapped to your fake REST API
            middlewares.push(apiMocker(
                '/api',
                'mocks/api'
            ));

            // Static files
            middlewares.push(connect.static(options.base));
            middlewares.push(connect.static(__dirname));

            return middlewares;
          }
        }
      }
    }
  });
}
```

After you can run your server with `grunt connect` command. You will see `/api` will be mapped to `mocks/api`.

### Using with Webpack

To use api mocker on your [Webpack][] projects, simply add a setup options to your [webpack-dev-server][] options:

> [devServer.setup](https://doc.webpack-china.org/configuration/dev-server/#devserver-setup) , This option is deprecated in favor of before and will be removed in v3.0.0.

```js
  ...
  before: function(app) {
    app.use(apiMocker('/api', 'mocks/api'));
  },
  ...
```
### Using with CRA

To use api mocker on your [cra][] projects, please install [customize-cra] and [react-app-rewired] using npm to modify webpack config file:
```
npm install customize-cra react-app-rewired --save-dev
```
Then, create a file named config-overrides.js, override webpack config using below codes:

```js
  const apiMocker = require("connect-api-mocker"),
    { overrideDevServer } = require("customize-cra");

  const devServerConfig = () => config => {
    return {
        ...config,
        before: (app,server)=> {
            //call cra before function to not break code
            config.before(app, server);
            //Then add our mocker url and folder 
            app.use(apiMocker('/api', 'mocks/api'));
        } 
    }
  }

  module.exports = {
    devServer: overrideDevServer(
      devServerConfig()
    )
  };
```
Finally, change our run method to from "react-scripts start" to "react-app-rewired start" in package.json file:
```js
...
"scripts": {
    "start": "react-app-rewired start",
    ...
  }
  ...
```
### Using with other languages other than JavaScript

If you have a Python/Ruby/.NET etc. project and want to use that mocking functionality, you can use [cli-api-mocker](https://github.com/muratcorlu/cli-api-mocker) as a wrapper of connect-api-mocker for command line. With the help of cli-api-mocker, if you run `mockit` command, you will have a seperate web server that will handle your mocks as a REST API. Please look for [cli-api-mocker readme](https://github.com/muratcorlu/cli-api-mocker) for details.

## Directory Structure

You need to use service names as directory name and http method as filename. Middleware will match url to directory structure and respond with the corresponding http method file.

Example REST service: `GET /api/messages`

Directory Structure:

```
_ api
  \_ messages
     \_ GET.json
```

Example REST service: `GET /api/messages/1`

Directory Structure:

```
_ api
  \_ messages
     \_ 1
        \_ GET.json
```

Example REST service: `POST /api/messages/1`

Directory Structure:

```
_ api
  \_ messages
     \_ 1
        \_ POST.json
```


Example REST service: `DELETE /api/messages/1`

Directory Structure:

```
_ api
  \_ messages
     \_ 1
        \_ DELETE.json
```

## Custom responses

If you want define custom responses you can use `js` files with a middleware function that handles requests.

Example REST service: `POST /api/messages`

Directory Structure:

```
_ api
  \_ messages
     \_ POST.js
```

`POST.js` file:

```js
module.exports = function (request, response) {
  if (!request.get('X-Auth-Key')) {
    response.status(403).send({});
  } else {
    response.sendFile('POST.json', {root: __dirname});
  }
}
```

`POST.js` file for non ExpressJS server:

```js
const fs = require('fs');
const path = require('path');

module.exports = (request, response) => {
  if (!request.get('X-Auth-Key')) {
    response.statusCode = 403;
    response.end();
  } else {
    const filePath = path.join(__dirname, 'POST.json');
    const stat = fs.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': stat.size
    });

    const readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(response);
  }
}
```
### Another Example: Respond different json files based on a query parameter:

- Request to `/users?type=active` will be responded by `mocks/users/GET_active.json`
- Request to `/users` will be responded by `mocks/users/GET.json`

`GET.js` file:

```js
const fs = require('fs');
const path = require('path');

module.exports = function (request, response) {
  let targetFileName = 'GET.json';

  // Check is a type parameter exist
  if (request.query.type) {
    // Generate a new targetfilename with that type parameter
    targetFileName = 'GET_' + request.query.type + '.json';
  }
  const filePath = path.join(__dirname, targetFileName);
  // If file does not exist then respond with 404 header
  try {
    fs.accessSync(filePath);
  }
  catch (err) {
    return response.status(404);
  }
  // Respond with filePath
  response.sendFile(filePath);
}
```
`GET.js` file for non ExpressJS server:
```js
const url =  require('url');
const fs = require('fs');
const path = require('path');

module.exports = function (request, response) {
  let targetFileName = 'GET.json';
  const typeQueryParam = url.parse(request.url, true).query.type;
  // Check is a type parameter exist
  if (typeQueryParam) {
    // Generate a new targetfilename with that type parameter
    targetFileName = 'GET_' + typeQueryParam + '.json';
  }

  var filePath = path.join(__dirname, targetFileName);

  // If file does not exist then respond with 404 header
  try {
    fs.accessSync(filePath);
  }
  catch (err) {
    response.statusCode = 404;
    response.end();
    return;
  }

  const stat = fs.statSync(filePath);
  response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': stat.size
  });

  const readStream = fs.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(response);
}
```

## Helper functions for custom responses

Connect-Api-Mocker also presents a bunch of helper functions to speed up writing simple custom responses. There are:

- `status(statusCode)`: Set status code of response
- `notFound(message?)`: Set status code as 404 and optionally sends message
- `created()`: Sets status code as 201
- `success()`: Sets status code as 200
- `delay(duration)`: Delays the request by given duration(in ms).
- `json(data|callback(req,res))`: Send given JSON object as response.
- `file(filePath)`: Responds with the content of file in given path(full path)
- `type(contentType)`: Sets content-type header.
- `end(body)`: Ends request and optionally sends the string output

You can use these functions in custom responses, like:

```js
const { notFound } = require('connect-api-mocker/helpers');

module.exports = notFound('Page is not found');
```

Also you can combine multiple functions:

```js
const { delay, created, json } = require('connect-api-mocker/helpers');

module.exports = [delay(500), created(), json({success: true})];
```

`json` middleware also accepts a callback that has request and response objects as parameters:

``js
const { json } = require('connect-api-mocker/helpers');

module.exports = [json(req => ({
  id: req.params.userId, success: true
}))];
```

Another example to return image as response:

```js
const { type, file } = require('connect-api-mocker/helpers');

// Assuming a file named GET.png exists next to this file
const filePath = path.join(__dirname, './GET.png');

module.exports = [type('image/png'), file(filePath)];
```

## Wildcards in requests

You can use wildcards for paths to handle multiple urls(like for IDs). If you create a folder structure like `api/users/__user_id__/GET.js`, all requests like `/api/users/321` or `/api/users/1` will be responded by custom middleware that defined in your `GET.js`. Also id part of the path will be passed as a request parameter named as `user_id` to your middleware. So you can write a middleware like that:

`api/users/__user_id__/GET.js` file:

```js
module.exports = function (request, response) {
  response.json({
    id: request.params.user_id
  });
}
```

You can also define `ANY.js` or `ANY.json` files that catch all methods.

`api/users/__user_id__/ANY.js` file:

```js
module.exports = function (request, response) {
  response.json({
    id: request.params.user_id,
    method: request.method
  });
}
```

## XML Support

Api Mocker also can handle XML responses. As you can see, for custom responses, it's not an issue. Because you are completely free about responses in custom responses. But for simple mocks, api mocker try to find a json file by default. You can set that behaviour as `type` in api mocker configuration:

```js
app.use('/user-api', apiMocker({
  target: 'other/target/path',
  type: 'xml'
}));
```

If you use `xml` as type, api mocker should look for `mocks/users/GET.xml` file for a request to `/users`. Also you can use `auto` for type:

```js
app.use('/user-api', apiMocker({
  target: 'other/target/path',
  type: 'auto'
}));
```

In that case, api mocker will look for `Accept` header in the request to determine response format. So, if you make a request with a `Accept: application/json` header, it'll try to send a response with a `json` file. If you make a request with a `Accept: application/xml` header, it'll try to send a response with an `xml` file.

## Defining multiple mock configurations

You can use apiMocker multiple times with your connect middleware server. In example below, we are defining 3 mock server for 3 different root paths:

```js
app.use('/api/v1', apiMocker('target/path'));
app.use('/user-api', apiMocker({
  target: 'other/target/path'
}));
app.use(apiMocker('/mobile/api', {
  target: 'mocks/mobile'
});
```

## Next on not found option

If you have some other middlewares that handles same url(a real server proxy etc.) you can set `nextOnNotFound` option to `true`. In that case, api mocker doesnt trigger a `404` error and pass request to next middleware. (default is `false`)

```js
apiMocker('/api', {
  target: 'mocks/api',
  nextOnNotFound: true
});
```

With that option, you can mock only specific urls simply.

## Body parser

By default request body is pre-processed with [body-parser](https://github.com/expressjs/body-parser). Default body-parser configuration uses JSON parser. Example belows configures usage of `json` (default) parser. In order to disable default pre-processing set `bodyParser` option to `false`.

```js
apiMocker('/text', {
  target: 'test/mocks',
  bodyParser: false
})
```

In order to modify default body-parser behaviour use `bodyParser` object.
`bodyParser` object supports configuration of

 - parser type via `type` setting. 
 - parser options via `options` setting.

Supported parsers and corresponding options can be found [here](https://github.com/expressjs/body-parser#bodyparserjsonoptions)

Example belows configures usage of `text` parser for requests with `content-type=application/vnd.custom-type`
```js
apiMocker('/text', {
  target: 'test/mocks',
  bodyParser: {
    type: 'text',
    options: { type: 'application/vnd.custom-type' }
  }
})
```

## Logging

If you want to see which requests are being mocked, set the `verbose` option either to `true` or provide your own function.

```js
apiMocker('/api', {
  target: 'mocks/api',
  verbose: ({ req, filePath, fileType }) => console.log(`Mocking endpoint ${req.originalUrl} using ${filePath}.${fileType}.`)
});
```

<!-- Definitions -->

[connect]: https://github.com/senchalabs/connect
[express]: https://github.com/expressjs/express
[browsersync]: https://github.com/BrowserSync/browser-sync
[browser-sync]: https://github.com/BrowserSync/browser-sync
[lite-server]: https://github.com/johnpapa/lite-server
[webpack]: https://github.com/webpack/webpack
[webpack-dev-server]: https://github.com/webpack/webpack-dev-server
[cra]: https://github.com/facebook/create-react-app
[customize-cra]: https://github.com/arackaf/customize-cra
[react-app-rewired]: https://github.com/timarney/react-app-rewired
