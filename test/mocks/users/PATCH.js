module.exports = function (req, res, next) {
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    res.json({
      requestString: data
    });

    next();
  });
};
