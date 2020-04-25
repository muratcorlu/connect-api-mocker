const fs = require('fs');

module.exports = filePath => (req, res) => {
  fs.createReadStream(filePath).pipe(res);
};
