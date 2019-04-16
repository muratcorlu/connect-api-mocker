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
});
