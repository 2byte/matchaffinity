/**
 * Guerilla api tools
 *
 **/

var util = require('util');
var request = require('request');

/**
 * Initialize
 * @param ip
 * @param agent
 * @constructor
 */
function Guerilla(ip, agent) {
    this.ip = ip;
    this.agent = agent;

    var self = this;

    // Create url to api guerilla
    this.createUrl = function (func, params) {
        if (!params) params = {};

        params = Object.keys(params).map(function (key) {
            return util.format('%s=%s', key, params[key]);
        }).join('&');

        return util.format('http://api.guerrillamail.com/ajax.php?f=%s&ip=%s&agent=%s&%s', func, self.ip, self.agent, params);
    };

    // Util random string
    this.randomString = function (len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz,randomPoz+1);
        }
        return randomString;
    };

    this.setCookie = function (cookies) {
        self.cookies = cookies;
        self.requestJar.setCookie(request.cookie(cookies));
    };

    this.requestJar = request.jar();
    this.request = request.defaults({jar: this.requestJar});

    this.email;
    this.sid_token;
    this.cookies;
    this.fullResponse;
}

/**
 * Getting email
 * @param params
 * @param cb
 */
Guerilla.prototype.getEmail = function (params, cb) {

    if (typeof params == 'function')
        cb = params;
    if (!params) params = {};

    var self = this;

    var url = this.createUrl('get_email_address', params);

    this.request(url, function (err, req, body) {
        if (err) {
            cb(err);
        } else {
            try {
                var guerillaResponse = JSON.parse(body);

                self.email = guerillaResponse.email_addr;
                self.sid_token = guerillaResponse.sid_token;
                self.cookies = self.requestJar.getCookieString(url);
                self.fullResponse = guerillaResponse;

            } catch (e) {
                return cb(e);
            }

            cb.call(self, null);
        }
    });
};

/**
 * Setting a custom email
 * @param params
 * @param cb
 */
Guerilla.prototype.setEmail = function (params, cb) {
    if (typeof params == 'function')
        cb = params;
    if (!params) params = {};

    var self = this;
    var url = this.createUrl('get_email_address', params);

    this.request(url, function (err, res, body) {
        if (err) {
            cb(err);
        } else {
            try {
                var guerillaResponse = JSON.parse(body);

                self.email = guerillaResponse.email_addr;
                self.sid_token = guerillaResponse.sid_token;
                self.cookies = self.requestJar.getCookieString(url);
                self.fullResponse = guerillaResponse;

            } catch (e) {
                return cb(e);
            }

            cb.call(self, null);
        }
    });
};

/**
 * Check email
 * @param params
 * @param cb
 */
Guerilla.prototype.checkEmail = function (params, cb) {
    if (typeof params == 'function')
        cb = params;
    if (!params) params = {};

    var self = this;
    var url = this.createUrl('check_email', params);

    this.request(url, function (err, req, body) {
        if (err) {
            cb(err);
        } else {console.log(req.headers);
            try {
                var guerillaResponse = JSON.parse(body);

                self.email = guerillaResponse.email_addr;
                self.sid_token = guerillaResponse.sid_token;
                self.cookies = self.requestJar.getCookieString(url);
                self.fullResponse = guerillaResponse;

            } catch (e) {
                return cb(e);
            }

            cb.apply(self, [null, guerillaResponse]);
        }
    });
};

/**
 * Getting email list
 * @param params
 * @param cb
 */
Guerilla.prototype.getEmailList = function (params, cb) {

    if (typeof params == 'function')
        cb = params;
    if (!params) params = {};

    var self = this;
    var url = this.createUrl('get_email_list', params);

    this.request(url, function (err, req, body) {
        if (err) {
            cb(err);
        } else {
            try {
                var guerillaResponse = JSON.parse(body);

                self.email = guerillaResponse.email_addr;
                self.sid_token = guerillaResponse.sid_token;
                self.cookies = self.requestJar.getCookieString(url);
                self.fullResponse = guerillaResponse;

            } catch (e) {
                return cb(e);
            }

            cb.apply(self, [null, guerillaResponse]);
        }
    });
};

module.exports = Guerilla;