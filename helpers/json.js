module.exports = data => (req, res) => {
  let responseData = data;
  if (typeof data === 'function') {
    responseData = data(req, res);
  }
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(responseData));
};
