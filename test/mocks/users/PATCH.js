module.exports = function (req, res, next) {
  var data = "";
  req.on('data', function(chunk){ data += chunk})
  req.on('end', function(){
    req.rawBody = data;
    res.json({
      requestString: data
    });

    next();
  })
}