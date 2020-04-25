const path = require('path');
const { type, file } = require('../../../../../helpers');

const filePath = path.join(__dirname, './GET.png');

module.exports = [type('image/png'), file(filePath)];
