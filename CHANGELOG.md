## 1.6.0 (2019-08-08)

### Features:

- BodyParser settings are now configurable

## 1.4.0 (2018-09-27)

### Features:

- Now you can define mock files for catching all methods once. You can just use names `ANY.json` or `ANY.js`. (Thanks to @daanoz)
- Matching with nested wildcard improved. [#25](https://github.com/muratcorlu/connect-api-mocker/pull/25)

## 1.3.5 (2018-02-01)

### Features:

- Verbose mode added. (Thanks to @iakovmarkov)

## 1.3.5 (2018-01-12)

### Features:

- Body Parser added as a internal dependency. So if you can read json body from request objects without any hassle.

## 1.3.4 (2017-10-04)

### Features:

- Custom middlewares will not cached anymore. So you don't need to restart your server when you changed your custom middlewares.

## 1.3.3 (2017-08-29)

### Features:

- XML Support added with the `type` config parameter

## 1.3.2 (2017-08-15)

### Improvements:

- Base url may be root path now.

## 1.3.1 (2017-08-03)

### Fixes:

- Checking for wildcard folders fail when no mocks folder exits

## 1.3 (2017-07-24)

### Breaking Changes:

- speedLimit feature removed
- Setting multiple routes at once feature removed

### Features:

- `baseUrl` can be set in outside of api mocker. For example, these are valid usage examples:

```js
app.use('/api', apiMocker('target/path'));

// or
app.use('/api/v[1-9]{1,2}/', apiMoker({
    target: 'target/path',
    nextOnNotFound: true
}));
```

- Wildcards in paths [#6](https://github.com/muratcorlu/connect-api-mocker/issues/6)

## 1.2.4 (2017-05-21)

### Features:

- Added support for lite-server and browser-sync

## 1.2.3 (2017-03-15)

### Fixes:

- Target path doesn't ignore leading slash

## 1.2.2 (2017-03-15)

### Improvements:

- Leading and trailing slashes on target path and requested paths are ignored

## 1.2.1 (2016-10-01)

### Improvements:

- JSON content-type response header added (#2 - thanks to @zaycker)

## 1.2.0 (August 2016)

### Features:

- Added ability to writing custom responses with JS files instead of JSON files.
- Added `nextOnNotFound` option
- Added support for setting multiple configurations at once

### Fixes:

- A filesystem bug fixed
