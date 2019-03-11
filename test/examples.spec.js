const request = require('supertest');
const express = require('express');
const apiMocker = require('..');

const app = express();

app.use('/api/v1', apiMocker('examples/redefine-default-mounting/states/base'));

describe('Redefine default mounting', () => {
  it('responds for simple GET request', (done) => {
    request(app)
      .get('/api/v1/profile')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        profile: {
          first_name: 'Aaron',
          last_name: 'Pol'
        }
      }, done);
  });

  it('redefine GET response', (done) => {
    app.use('/api/v1', apiMocker('examples/redefine-default-mounting/states/my-own-state'));

    request(app)
      .get('/api/v1/profile')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        profile: {
          first_name: 'Bryan',
          last_name: 'Cranston'
        }
      }, done);
  });
});
