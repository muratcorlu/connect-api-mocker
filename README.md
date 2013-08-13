connect-api-mocker
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
