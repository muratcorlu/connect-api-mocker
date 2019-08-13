const request = require('supertest');
const express = require('express');
const fs = require('fs');
const apiMocker = require('..');

const app = express();

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

app.use('/api', apiMocker('test/mocks'));
app.use('/v2', apiMocker({
  target: 'test/mocks',
  nextOnNotFound: true,
  verbose: true
}));
app.use('/v2', (req, res) => {
  res.json({
    message: 'Fallback'
  });
});
app.use(apiMocker('/v3', 'test/mocks'));
app.use(apiMocker('/v4', {
  target: 'test/mocks'
}));
app.use('/notdefined', apiMocker('notdefined'));
app.use(apiMocker('/xml', {
  target: 'test/mocks',
  type: 'xml',
  verbose() {
    // sth with message
  }
}));
app.use(apiMocker('/dyn', {
  target: 'test/mocks',
  type: 'auto'
}));
app.use(apiMocker('/text', {
  target: 'test/mocks',
  bodyParser: {
    type: 'text',
    options: { type: 'application/vnd.custom-type' }
  }
}));
app.use('/disable-body-parser', apiMocker({
  target: 'test/mocks/bodyParser/disabled',
  bodyParser: false
}));


describe('Simple configuration with baseUrl', () => {
  it('responds for simple GET request', (done) => {
    request(app)
      .get('/api/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        method: 'GET'
      }, done);
  });

  it('responds for simple POST request', (done) => {
    request(app)
      .post('/api/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        method: 'POST'
      }, done);
  });

  it('custom response will not cache', (done) => {
    fs.mkdirSync('./test/mocks/users/2');
    fs.writeFileSync('./test/mocks/users/2/GET.js', fs.readFileSync('./test/mocks/users/__user_id__/GET_example1.js'));

    request(app)
      .post('/api/users/2')
      .expect({
        version: 1
      });

    fs.writeFileSync('./test/mocks/users/2/GET.js', fs.readFileSync('./test/mocks/users/__user_id__/GET_example2.js'));

    request(app)
      .post('/api/users/2')
      .expect({
        version: 2
      }, () => {
        done();
        deleteFolderRecursive('./test/mocks/users/2');
      });
  });
});

describe('nextOnNotFound setting', () => {
  it('returns correct response when mock is exits', (done) => {
    request(app)
      .get('/v2/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        method: 'GET'
      }, done);
  });

  it('returns fallback when mock is not exits', (done) => {
    request(app)
      .get('/v2/non-existing-resource')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        message: 'Fallback'
      }, done);
  });
});

describe('Simple configuration without baseUrl', () => {
  it('returns correct response', (done) => {
    request(app)
      .get('/v3/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        method: 'GET'
      }, done);
  });
});

describe('Configuration with object and without baseUrl', () => {
  it('returns correct response', (done) => {
    request(app)
      .get('/v4/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        method: 'GET'
      }, done);
  });
});

describe('Wildcard feature', () => {
  it('works properly when no mock exist for request', (done) => {
    request(app)
      .get('/notdefined/products/1')
      .expect(404, done);
  });

  it('wildcard mock works properly', (done) => {
    request(app)
      .get('/api/users/2812391232')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        id: '2812391232',
        method: 'GET'
      }, done);
  });

  it('wildcard mock works properly with nested resources', (done) => {
    request(app)
      .get('/api/users/1/nested')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({
        result: 'WILDCARD_NESTED'
      }, done);
  });

  it('wildcard json methods should work on any given method', (done) => {
    request(app)
      .get('/api/users/1/any-json-request')
      .expect(200)
      .expect({
        method: 'ANY'
      }, () => {
        request(app)
          .post('/api/users/1/any-json-request')
          .expect(200)
          .expect({
            method: 'ANY'
          }, done());
      });
  });

  it('wildcard js methods should work on any given method', (done) => {
    request(app)
      .get('/api/users/1/any-js-request')
      .expect(200)
      .expect({
        anyMethod: 'GET'
      }, () => {
        request(app)
          .post('/api/users/1/any-js-request')
          .expect(200)
          .expect({
            anyMethod: 'POST'
          }, done());
      });
  });
});


describe('Response type config', () => {
  it('works properly with xml responses', (done) => {
    request(app)
      .get('/xml/users/1')
      .expect('Content-Type', /xml/)
      .expect(200, done);
  });

  it('works properly with auto type (xml)', (done) => {
    request(app)
      .get('/dyn/users/1')
      .set('Accept', 'application/xml')
      .expect('Content-Type', /xml/)
      .expect(200, done);
  });

  it('works properly with auto type (json)', (done) => {
    request(app)
      .get('/dyn/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('works properly with auto type (xml not found)', (done) => {
    request(app)
      .post('/dyn/users/2')
      .set('Accept', 'application/xml')
      .expect(404, done);
  });
});

describe('Handling request body', () => {
  it('should work with request body json', (done) => {
    request(app)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send({ name: 'A name' })
      .expect(201)
      .expect({
        name: 'A name'
      }, done);
  });

  it('should work with disabled request body', (done) => {
    request(app)
      .post('/disable-body-parser')
      .send({ todo: 'buy milk' })
      .expect(201)
      .expect('buy milk', done);
  });

  it('should work with request body raw', (done) => {
    request(app)
      .post('/text/bodyParser')
      .set('Content-Type', 'application/vnd.custom-type')
      .send('plain text')
      .expect(201)
      .expect('plain text', done);
  });

  it('shouldnt break to capability of reading raw request body', (done) => {
    request(app)
      .patch('/api/users')
      .send('A text content')
      .expect(200)
      .expect({
        requestString: 'A text content'
      }, done);
  });
});
