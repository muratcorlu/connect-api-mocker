module.exports = duration => (req, res, next) => {
  setTimeout(next, duration);
};
