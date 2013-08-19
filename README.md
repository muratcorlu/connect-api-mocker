connect-api-mocker
==================
`connect-api-mocker` is a [connect.js](https://github.com/senchalabs/connect) middleware that fakes REST API server with filesystem. It will be helpful when you try to test your application without the actual REST API server.

## Usage

You can use it with [Grunt](http://gruntjs.com). After you install [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) add api-mocker middleware to your grunt config. The `mocks/api` folder will be served as REST API at `/api`.

```js

module.exports = function(grunt) {
  var apiMocker = require('./lib/middlewares/api-mocker');

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

connect-api-mocker(Turkish)
==================

`connect-api-mocker`, REST API'lerle haberleşen web uygulamaları yaparken, uygulamayı REST API'nın sınırlılıklarından bağımsız olarak test edebilmek için, dosya sistemiyle sahte bir REST API sunmaya yarayan bir [connect.js](https://github.com/senchalabs/connect) middleware'ıdır.

## Kullanım

Bu middleware [Grunt](http://gruntjs.com) ile kolayca kullanılabilir. [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) eklentisi kurulduktan sonra, konfigürasyona api-mocker middleware'i aşağıdaki gibi eklendiğinde, projenin `mocks/api` klasörü, `/api` adresinden REST servisi gibi sunulmaya başlanacaktır:

```js

module.exports = function(grunt) {
  var apiMocker = require('./lib/middlewares/api-mocker');

  grunt.loadNpmTasks('grunt-contrib-connect');  // Connect - Gelistirme sunucusu

  // Project configuration.
  grunt.initConfig({

    // Gelistirme sunucusu
    connect: {
      server: {
        options: {
          base: './build',
          port: 9001,
          middleware: function(connect, options) {

            var middlewares = [];

            // mock/rest klasorunu sahte servis katmani olarak kullan
            middlewares.push(apiMocker(
                '/api',
                'mocks/api'
            ));

            // Statik dosyalar
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

Daha sonra `grunt connect` komutuyla statik sunucu çalıştırıldığında `/api` adresi ile `mocks/api` klasörünün REST API olarak sunulduğu görülecektir.

## Klasör yapısı

REST servis URL'i ile aynı yapıda klasör yapısı oluşturularak, oluşturulan klasöre HTTP talep tipi ile aynı adda JSON dosyaları eklenerek bu adrese, bu tiplerde yapılan taleplere belirtilen JSON kaynaklarının gönderilmesi sağlanabilir.

Örnek REST servisi: `GET /api/messages`

Dosya sistemi yapısı:

```
_ api
  \_ messages
     \_ GET.json
```

Örnek REST servisi: `GET /api/messages/1`

Dosya sistemi yapısı:

```
_ api
  \_ messages
     \_ 1
        \_ GET.json
```

Örnek REST servisi: `POST /api/messages/1`

Dosya sistemi yapısı:

```
_ api
  \_ messages
     \_ 1
        \_ POST.json
```


Örnek REST servisi: `DELETE /api/messages/1`

Dosya sistemi yapısı:

```
_ api
  \_ messages
     \_ 1
        \_ DELETE.json
```

## Hız limiti simülasyonu

api-mocker'ın 3. parametresi hız limitidir. Bu değer kilobit/saniye cinsindendir ve varsayılan olarak 0 yani limitsizdir. Düşük internet hızlarında uygulamanızın tepkisini ölçmek için bu özellik kullanılabilir.

Örnek grunt konfigürasyonu:

```js
...
          middleware: function(connect, options) {

            var middlewares = [];

            // mock/rest klasorunu sahte servis katmani olarak kullan
            middlewares.push(apiMocker(
                '/api',
                'mocks/api',
                50          // 50 kilobit/saniye hızda gönder
            ));
...
```
