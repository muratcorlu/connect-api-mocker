const express = require('../../node_modules/express');
const apiMocker = require('../../index');

const app = express();

// default response
app.use('/', apiMocker('states/base'));

// definite state, where default response can be changed
app.use('/', apiMocker('states/my-own-state'));

app.listen(9090);
