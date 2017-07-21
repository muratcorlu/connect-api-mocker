var request = require('supertest');
var express = require('express');
var apiMocker = require('../api-mocker');
var app = express();

app.use('/api', apiMocker('tests/mocks'));
app.use('/v2', apiMocker({
    target: 'tests/mocks',
    nextOnNotFound: true
}));
app.use('/v2', function (req, res) {
    res.json({
        message: 'Fallback'
    })
});
app.use(apiMocker('/v3', 'tests/mocks'));
app.use(apiMocker('/v4', {
    target: 'tests/mocks'
}));

request(app)
  .get('/api/users/1')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      method: 'GET'
  })
  .end(function(err, res) {
    if (err) throw err;
  });

request(app)
  .post('/api/users/1')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      method: 'POST'
  })
  .end(function(err, res) {
    if (err) throw err;
  });

request(app)
  .get('/api/users/2812391232')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      id: '2812391232',
      method: 'GET'
  })
  .end(function(err, res) {
    if (err) throw err;
  });

request(app)
  .get('/v2/users/1')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      method: 'GET'
  })
  .end(function(err, res) {
    if (err) throw err;
  });

request(app)
  .get('/v2/non-existing-resource')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      message: 'Fallback'
  })
  .end(function(err, res) {
    if (err) throw err;
  });


request(app)
  .get('/v3/users/1')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      method: 'GET'
  })
  .end(function(err, res) {
    if (err) throw err;
  });


request(app)
  .get('/v4/users/1')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect({
      method: 'GET'
  })
  .end(function(err, res) {
    if (err) throw err;
  });
