const request = require('supertest');
const express = require('express');
const apiMocker = require('..');

const app = express();

app.use('/api', apiMocker('test/mocks/helpers'));

describe('Helpers', () => {
  it('delay, created(status), json response', (done) => {
    request(app)
      .post('/api/users')
      .expect('Content-Type', /json/)
      .expect(201)
      .expect({
        success: true
      }, done);
  });

  it('json helper with callback', (done) => {
    request(app)
      .put('/api/users/1')
      .expect('Content-Type', /json/)
      .expect({
        success: true,
        id: '1'
      }, done);
  });

  it('notFound', (done) => {
    request(app)
      .get('/api/users')
      .expect(404, done);
  });

  it('success', (done) => {
    request(app)
      .patch('/api/users')
      .expect(200, done);
  });

  it('type, file', (done) => {
    request(app)
      .get('/api/users/avatar')
      .expect('Content-Type', 'image/png')
      .expect('Content-Length', '0')
      .expect(200, done);
  });
});
