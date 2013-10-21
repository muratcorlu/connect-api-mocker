/*
* Copyright 2013 Sahibinden Bilgi Teknolojileri Pazarlama ve Ticaret A.Ş.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
