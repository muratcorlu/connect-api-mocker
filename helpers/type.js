module.exports = type => (req, res, next) => {
  res.setHeader('Content-Type', type);
  next();
};
