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
