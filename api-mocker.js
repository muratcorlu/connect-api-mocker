/*
* Copyright 2016 Murat Çorlu <muratcorlu@gmail.com>
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
 * A connect middleware to serve a RESTful api by some json and js files
 *
 * @author Murat Çorlu <muratcorlu@gmail.com>
 */
var fs = require('fs');

/**
 * @param {string} urlRoot Base path for API url eg: /api
 * @param {string} pathRoot Base path of API mock files. eg: ./mock/api
 * @param {integer} speedLimit Speed limit simulation by kb/sec metric. default is unlimited
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
            var url = req.path,
                filePath = pathRoot + url + '/'+req.method;

            fs.realpath(filePath + '.js', function (err, fullPath) {
                if (!err) {
                    var customMiddleware = require(fullPath);
                    customMiddleware(req, res, next);
                } else {
                    fs.readFile(filePath+'.json', function(err, buf){
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
                }
            });

        } else {
            next();
        }
    };
};
