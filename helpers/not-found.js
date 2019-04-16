const status = require('./status');
const end = require('./end');

module.exports = message => [status(404), end(message)];
