connect-api-mocker
==================
`connect-api-mocker` is a [connect.js](https://github.com/senchalabs/connect) middleware that fakes REST API server with filesystem. It will be helpful when you try to test your application without the actual REST API server.

## Installation

```
npm install connect-api-mocker
```

## Usage

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

## Directory Structure

You need to use service names as directory name and http method as filename. Files must be JSON. Middleware will match url to directory structure and respond with the corresponding http method file.

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
    response.sendFile('POST.json');
  }
}
```

## Bandwidth simulation

3rd parameter of api-mocker is for bandwidth limit. Metric is kilobit/sec and default value is 0(unlimited). You can use this to test your application in low bandwidth.

Example grunt configuration:

```js
...
          middleware: function(connect, options) {

            var middlewares = [];

            // mock/rest directory will be mapped to your fake REST API
            middlewares.push(apiMocker(
                '/api',
                'mocks/api',
                50          // limit bandwidth to 50 kilobit/second
            ));
...
```
