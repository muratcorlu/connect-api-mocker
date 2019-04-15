const { delay, created, json } = require('../../../../helpers');

module.exports = [delay(100), created(), json({ success: true })];
