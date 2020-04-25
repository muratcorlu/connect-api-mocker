const fs = require('fs');

module.exports = filePath => (req, res) => {
  const stat = fs.statSync(filePath);

  res.setHeader('Content-Length', stat.size);

  fs.createReadStream(filePath).pipe(res);
};
