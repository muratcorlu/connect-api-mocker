/**
 * Dosya sistemindeki json dosyalarını REST API gibi sunar.
 *
 * @author sahibinden.com
 */
var fs = require('fs');

/**
 * @param {string} urlRoot API'nin sunulacağı adres. örn: /api
 * @param {string} pathRoot API dosyalarının bulundugu klasör yolu. örn: ./mock/api
 * @param {integer} speedLimit Kb cinsinden hız limiti simulasyonu. Varsayılan olarak limitsiz
 */
module.exports = function (urlRoot, pathRoot, speedLimit) {
    // Trim url root address from path root address
    pathRoot = pathRoot.replace(urlRoot, '');

    // If a speedLimit not set, set unlimited
    if (!speedLimit) {
      speedLimit = 0; // Unlimited
    }
    return function(req, res, next){
        if (req.url.indexOf(urlRoot) === 0) {
            // Ignore querystrings
            var url = req.url.split('?')[0];

            fs.readFile('./' + pathRoot + url + '/'+req.method+'.json', function(err, buf){
                if (err) return next(err);

                var resp = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': buf.length
                    },
                    body: buf
                };
                res.writeHead(200, resp.headers);

                if (speedLimit) {
                    setTimeout(function() {
                        res.end(resp.body);
                    }, buf.length / (speedLimit * 1024 / 8 ) * 1000);
                } else {
                    res.end(resp.body);
                }
            });
        } else {
            next();
        }
    };
};
