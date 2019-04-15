module.exports = data => (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(data));
};
