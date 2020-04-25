module.exports = function (req, res) {
  const data = [];
  req
    .on('data', (chunk) => {
      data.push(chunk);
    })
    .on('end', () => {
      res.status(201).send(JSON.parse(data).todo);
    });
};
