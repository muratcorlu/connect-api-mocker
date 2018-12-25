module.exports = function (req, res, next) {
  next();

  try {
    res.send({
      profile: {
        first_name: 'Aaron',
        last_name: 'Pol'
      }
    });
  } catch (e) {
    //
  }
};
