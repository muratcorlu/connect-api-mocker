var request = require('supertest');
var express = require('express');
var apiMocker = require('../api-mocker');
var app = express();

app.use('/api', apiMocker('test/mocks'));
app.use('/v2', apiMocker({
    target: 'test/mocks',
    nextOnNotFound: true
}));
app.use('/v2', function (req, res) {
    res.json({
        message: 'Fallback'
    })
});
app.use(apiMocker('/v3', 'test/mocks'));
app.use(apiMocker('/v4', {
    target: 'test/mocks'
}));
app.use('/notdefined', apiMocker('notdefined'));

describe('Simple configuration with baseUrl', function () {
  it('responds for simple GET request', function (done) {
    request(app)
      .get('/api/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
          method: 'GET'
      }, done);
  });

  it('responds for simple POST request', function (done) {
    request(app)
    .post('/api/users/1')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect({
        method: 'POST'
    }, done);
  });

  it('wildcard mock works properly', function (done) {
    request(app)
    .get('/api/users/2812391232')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect({
        id: '2812391232',
        method: 'GET'
    }, done);;
  })
});

describe('nextOnNotFound setting', function () {
  it('returns correct response when mock is exits', function (done) {
    request(app)
      .get('/v2/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
          method: 'GET'
      }, done);
  });

  it('returns fallback when mock is not exits', function (done) {
    request(app)
      .get('/v2/non-existing-resource')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
          message: 'Fallback'
      }, done);
  });
});

describe('Simple configuration without baseUrl', function () {
  it('returns correct response', function (done) {
    request(app)
      .get('/v3/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
          method: 'GET'
      }, done);
  });
});

describe('Configuration with object and without baseUrl', function () {
  it('returns correct response', function (done) {
    request(app)
      .get('/v4/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
          method: 'GET'
      }, done);
  });
});

describe('Wildcard feature', function () {
  it('works properly when no mock exist for request', function (done) {
    request(app)
      .get('/notdefined/products/1')
      .expect(404, done);
  });
});

