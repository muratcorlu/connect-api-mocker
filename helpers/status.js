module.exports = status => (req, res, next) => {
  res.statusCode = status;
  next();
};
