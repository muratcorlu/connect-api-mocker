const { json } = require('../../../../../helpers');

module.exports = [
  json(req => ({
    success: true,
    id: req.params.userId
  }))
];
