/**
 * Auto registration to www.matchaffinity.com
 **/

var webdriverio = require('webdriverio');
var _ = require('lodash');
var Guerrilla = require('guerrilla-api');
var fs = require('fs');

/**
 * Initialization
 * @constructor
 */
function Match() {

    var optionsWebdriver = {
        desiredCapabilities: {
            browserName: 'chrome'
        }
    };

    this.client = webdriverio
        .remote(optionsWebdriver)
        .init();

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

    // Save cookies
    this.saveCookie = function (cookies) {
        fs.writeFileSync(__dirname + '/storage/cookie.json', JSON.stringify(cookies));
    };

    // Get cookies
    this.getCookie = function () {
        return JSON.parse(fs.readFileSync(__dirname + '/storage/cookie.json').toString());
    };

    this.guerrillaApi = new Guerrilla('127.0.0.1', 'automated-test-agent');
    this.email;
    this.prevSession = false;
    this.username = this.randomString(7);
    this.password = this.randomString(7);
}

Match.prototype.randomRadio = function (selector, cb) {
    var self = this;

    this.client.elements(selector).then(function (elems) {
        self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT).then(cb);
    });
};

Match.prototype.randomSelect = function(selector, cb) {
    var self = this;

    this.client.elements(selector + ' option').then(function (elems) {
        var optionIndex;

        if (elems.value.length > 2)
            optionIndex = _.random(1, elems.value.length - 1);
        else
            optionIndex = 1;

        self.client.selectByIndex(selector, optionIndex);
    });
};

Match.prototype.waitText = function (selector, searchText, cb) {
    this.client.waitUntil(function() {
        return this.getText(selector).then(function(text) {

            if (text[0] == searchText) {
                cb();
            }

            return text[0] == searchText;
        });
    });
};

/**
 * Step 1
 * @param data
 */
Match.prototype.step1 = function (data) {
    var self = this;

    this.client
        .url('http://www.matchaffinity.com')
        .selectByValue('#my_kvk', '21');

    // Set input
    this.client
        .setValue('#my_birth_day', _.random(1, 30))
        .setValue('#my_birth_month', _.random(1, 12))
        .setValue('#my_birth_year', _.random(1980, 1983))
        .setValue('#my_pseudo', this.username)
        .setValue('#my_password', this.password);

    // Get email and paste to form
    this.client.waitForExist('#my_email', 15000).then(function () {
        self.guerrillaApi.setEmailAddress(self.randomString(10), function (err, address) {
            if (!err) {
                self.email = address;
                self.client.setValue('#my_email', address);
            } else {
                self.client.execute(function () {
                    alert('Ошибка получения email');
                });
            }
        });
    });

    this.client.waitForExist('#my_cgu', 15000).then(function () {
        self.client.click('#my_cgu');
    });

    this.client.waitForExist('#formSignup', 60000 * 5).then(function () {
        // Save cookie
        self.client.getCookie().then(function (cookies) {
            self.saveCookie(cookies);
        });

        self.step2();
    });
};

/**
 * Resumption previous session if enabled Match.prevSession = true
 * @param urlStep
 */
Match.prototype.resumptionSession = function (urlStep) {
    var self = this;

    // if enabled previous session
    if (this.prevSession) {
        this.getCookie().forEach(function (cookiesData) {
            self.client.setCookie({name: cookiesData.name, value: encodeURIComponent(cookiesData.value)});
        });

        this.client.url('http://www.matchaffinity.com').refresh().then(function () {
            self.client.url(urlStep);
        });
    }
};

/**
 * Step 2
 */
Match.prototype.step2 = function () {

    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php');

    // Select options
    this.client.waitForExist('input[name=TYSELFTESTYT_LI27IL_QTG51TQ]', 10000).then(function () {
        // Subtle
        self.client.elements('input[name=TYSELFTESTYT_LI27IL_QTG51TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Shy
        self.client.elements('input[name=TYSELFTESTYT_LI6IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Instinctive
        self.client.elements('input[name=TYSELFTESTYT_LI30IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Happiest at home
        self.client.elements('input[name=TYSELFTESTYT_LI3IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Methodical
        self.client.elements('input[name=TYSELFTESTYT_LI34IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Rational
        self.client.elements('input[name=TYSELFTESTYT_LI41IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT);
        });

        // Lively and energetic
        self.client.elements('input[name=TYSELFTESTYT_LI47IL_QTG5TQ]').then(function (elems) {
            self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT).then(function () {
                // To end submit
                self.client.submitForm('#formSignup');

                // Go step3
                self.step3();
            });
        });

    });
};

/**
 * Step 3
 */
Match.prototype.step3 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=2');

    this.client.waitUntil(function() {
        return this.getText('.ultTxt2').then(function(text) {

            if (text[0] == 'The man I am looking for should be:') {
                self.client.elements('input[name=TYSOCIOTESTYT_LI106IL_QTRTQ]').then(function (elems) {
                    self.client.elementIdClick(elems.value[_.random(0, elems.value.length - 1)].ELEMENT).then(function () {
                        self.client.click('#ultButton');

                        self.step4();
                    });
                });
            }

            return text[0] == 'The man I am looking for should be:';
        });
    });
};

/**
 * Step 4
 */
Match.prototype.step4 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=3');

    this.client.waitUntil(function() {
        return this.getText('.ultTxt2').then(function(text) {

            if (text[0] == 'I\'d like to meet someone who is:') {
                self.randomRadio('input[name=same_age]');
                self.randomRadio('input[name=search_height]');
                self.randomSelect('select[name=search_proximity]');
                self.randomSelect('select[name=rech_etudes]');
                self.randomSelect('select[name=study_weighting]');
                self.randomRadio('input[name="rech_ethnie[]"]');
                self.randomSelect('select[name=ethnie_weighting]');
                self.randomRadio('input[name="rech_religion[]"]');
                self.randomSelect('select[name=religion_weighting]');
                self.randomSelect('select[name=rech_enfant]');
                self.randomSelect('select[name=nb_children_weighting]');
                self.randomRadio('input[name=TYSELFTESTYT_LI44IL_QTG51TQ]');
                self.randomRadio('input[name=TYSELFTESTYT_LI13IL_QTG51TQ]');
                self.randomRadio('input[name=TYSELFTESTYT_LI24IL_QTG51TQ]', function () {
                    self.client.click('#ultButton');

                    self.step5();
                });
            }

            return text[0] == 'The man I am looking for should be:';
        });
    });
};

/**
 * Step 5
 */
Match.prototype.step5 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=4');

    this.waitText('.ultTxt2','Which of the following are you most attracted to in a man?', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI107IL_QTRTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step6();
            });
        });
    });
};

/**
 * Step 6
 */
Match.prototype.step6 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=5');

    this.waitText('.ultTxt2', 'When in a relationship, is it important to make long term plans together?', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI18IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI72IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI20IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI71IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI19IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI17IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI15IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI16IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI70IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI37IL_QTG51TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI10IL_QTG51TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step7();
            });
        });
    });
};

/**
 * Step 7
 */
Match.prototype.step7 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=6');

    this.waitText('.ultTxt2', 'If you\'re throwing a dinner party, what\'s likely to be on the menu?', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI104IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step8();
            });
        });
    });
};

/**
 * Step 8
 */
Match.prototype.step8 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=7');

    this.waitText('.ultTxt2', 'I am generally:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI69IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI75IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI9IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI83IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI84IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI85IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI2IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI12IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI11IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI25IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI26IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step9();
            });
        });
    });
};

/**
 * Step 9
 */
Match.prototype.step9 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=8');

    this.waitText('.ultTxt2', 'I am mostly:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI14IL_QTMTQ', function () {
            self.client.click('#ultButton').then(function () {
                self.step10();
            });
        });
    });
};

/**
 * Step 10
 */
Match.prototype.step10 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=9');

    this.waitText('.ultTxt2', 'I am best described as:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI42IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI45IL_QTG2TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI1IL_QTG2TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI88IL_QTG4TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI33IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI35IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI36IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI8IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI43IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI46IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step11();
            });
        });
    });
};

/**
 * Step 11
 */
Match.prototype.step11 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=10');

    this.waitText('.ultTxt2', 'I deal with stress by:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI109IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step12();
            });
        });
    });
};

/**
 * Step 12
 */
Match.prototype.step12 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=11');

    this.waitText('.ultTxt2', 'When with others I am mainly:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI4IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI22IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI23IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI32IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI39IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI28IL_QTG21TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI29IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI76IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI5IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI40IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step13();
            });
        });
    });
};

/**
 * Step 13
 */
Match.prototype.step13 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=12');

    this.waitText('.ultTxt2', 'I like spending some quality time with:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI110IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step14();
            });
        });
    });
};

/**
 * Step 14
 */
Match.prototype.step14 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=13');

    this.waitText('.ultTxt2', 'I like to feel free to live my life without constraint:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI49IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI50IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI51IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI52IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI53IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI54IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI55IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI56IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI57IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI58IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step15();
            });
        });
    });
};

/**
 * Step 15
 */
Match.prototype.step15 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=14');

    this.waitText('.ultTxt2', 'I like to make decisions alone without letting myself be influenced by others:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI59IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI60IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI61IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI62IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI63IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI64IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI65IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI66IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI67IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI68IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step16();
            });
        });

    });
};

/**
 * Step 16
 */
Match.prototype.step16 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=15');

    this.waitText('.ultTxt2', 'I\'d love to live:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI102IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step17();
            });
        });

    });
};

/**
 * Step 17
 */
Match.prototype.step17 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=16');

    this.waitText('.ultTxt2', 'To make me happy, just give me:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI103IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step18();
            });
        });

    });
};

/**
 * Step 18
 */
Match.prototype.step18 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=17');

    this.waitText('.ultTxt2', 'For me, the biggest luxury would be:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI113IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step19();
            });
        });

    });
};

/**
 * Step 19
 */
Match.prototype.step19 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=18');

    this.waitText('.ultTxt2', 'I like to treat myself with:', function () {
        self.randomRadio('input[name=TYSOCIOTESTYT_LI108IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step20();
            });
        });

    });
};

Match.prototype.step20 = function () {

};

module.exports = Match;