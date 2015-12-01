/**
 * Auto registration to www.matchaffinity.com
 **/

var webdriverio = require('webdriverio');
var _ = require('lodash');
var Guerrilla = require('guerrilla-api');
var fs = require('fs');
var os = require('os');
var flatfile = require('flat-file-db');

/**
 * Initialization
 * @constructor
 */
function Match(options) {

    var optionsWebdriver = {
        desiredCapabilities: {
            browserName: 'chrome'
        }
    };

    if (typeof options == 'object') {
        if (options.hasOwnProperty('socksProxy')) {
            optionsWebdriver.desiredCapabilities.proxy = {
                proxyType: 'manual',
                socksProxy: options.socksProxy
            };
        }
    }

    if (!options.hasOwnProperty('webdriver_disable')) {
        this.client = webdriverio
            .remote(optionsWebdriver)
            .init();
    }

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
    this.refreshPage = false;
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

        self.client.selectByIndex(selector, optionIndex).then(function () {
            if (cb) cb();
        });
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
    }, 10000);
};

/**
 * Save account data
 */
Match.prototype.saveAccountData = function (data) {
    var db = flatfile(__dirname +'/storage/account.txt', {fsync: true});

    db.on('open', function() {
        Object.keys(data).forEach(function (k, i) {
            db.put(k, data[k]);
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
        .setValue('#my_password', this.password).then(function () {
            self.saveAccountData({username: self.username, password: self.password});
        });

    // Get email and paste to form
    this.client.waitForExist('#my_email', 15000).then(function () {
        self.guerrillaApi.setEmailAddress(self.randomString(10), function (err, address) {
            if (!err) {
                self.email = address;
                self.client.setValue('#my_email', address);
                self.saveAccountData({email: self.email});
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
Match.prototype.resumptionSession = function (urlStep, cb) {
    var self = this;

    // if enabled previous session
    if (this.prevSession) {
        this.getCookie().forEach(function (cookiesData) {
            self.client.setCookie({name: cookiesData.name, value: encodeURIComponent(cookiesData.value)});
        });

        if (this.refreshPage) {
            this.client.url(urlStep).then(function () {

                if (cb) cb();
            });
        } else {
            this.client.url('http://www.matchaffinity.com').refresh().then(function () {
                self.client.url(urlStep).then(function () {
                    self.refreshPage = true;

                    if (cb) cb();
                });
            });
        }
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
                        self.client.click('#ultButton').then(function () {
                            self.step4();
                        });
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
                    self.client.pause(2000).then(function () {
                        self.client.click('#ultButton').then(function () {
                            self.step5();
                        });
                    });
                });
            }

            return text[0] == 'I\'d like to meet someone who is:';
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

/**
 * Step 20
 */
Match.prototype.step20 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=19');

    this.waitText('.ultTxt2', 'My top holiday destinations would be (choose up to three options):', function () {
        self.randomRadio('input[name="TYSELFTESTYT_LI93IL_QTQTQ[]"]', function () {
            self.client.click('#ultButton').then(function () {
                self.step21();
            });
        });

    });
};

/**
 * Step 21
 */
Match.prototype.step21 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=20');

    this.waitText('.ultTxt2', 'My favorite hobbies (3 choices possible)', function () {
        self.randomRadio('input[name="styl_hobbies[]"]', function () {
            self.client.click('#ultButton').then(function () {
                self.step22();
            });
        });

    });
};

/**
 * Step 22
 */
Match.prototype.step22 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=21');

    this.waitText('.ultTxt2', 'My favourite animals (choose up to three options)', function () {
        self.randomRadio('input[name="styl_pet[]"]');
        self.randomRadio('input[name="styl_sorties[]"]');
        self.randomRadio('input[name="styl_sports[]"]', function () {
            self.client.click('#ultButton').then(function () {
                self.step23();
            });
        });
    });
};

/**
 * Step 23
 */
Match.prototype.step23 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=22');

    this.waitText('.ultTxt2', 'The artistic style I most admire is:', function () {
        self.randomRadio('input[name=TYSELFTESTYT_LI38IL_QTMTQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step24();
            });
        });
    });
};

/**
 * Step 24
 */
Match.prototype.step24 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=23');

    this.waitText('.ultTxt2', 'My kind of music is (choose up to three options)', function () {
        self.randomRadio('input[name="TYSOCIOTESTYT_LI95IL_QTQTQ[]"]', function () {
            self.client.click('#ultButton').then(function () {
                self.step25();
            });
        });
    });
};

/**
 * Step 25
 */
Match.prototype.step25 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=24');

    this.waitText('.ultTxt2', 'The films I enjoy are usually (choose up to three options):', function () {
        self.randomRadio('input[name="TYSOCIOTESTYT_LI96IL_QTQTQ[]"]', function () {
            self.client.click('#ultButton').then(function () {
                self.step26();
            });
        });
    });
};

/**
 * Step 26
 */
Match.prototype.step26 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=25');

    this.waitText('.ultTxt2', 'I\'m ready for a long-term relationship:', function () {

        self.randomRadio('input[name=TYSELFTESTYT_LI74IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI73IL_QTG31TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI77IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI78IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI81IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI79IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI82IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI80IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI87IL_QTG41TQ]');
        self.randomRadio('input[name=TYSELFTESTYT_LI89IL_QTG41TQ]', function () {
            self.client.click('#ultButton').then(function () {
                self.step27();
            });
        });
    });
};

/**
 * Step 27
 */
Match.prototype.step27 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/test_new.php?page=26');

    this.waitText('.ultBlocLeft', 'My religion:', function () {

        self.randomSelect('select[name=my_religion]', function () {
            self.randomSelect('select[name=my_religion_behaviour]', function () {
                self.randomSelect('select[name=styl_foodhabit]', function () {
                    self.randomSelect('select[name=prof_alcohol]', function () {
                        self.randomSelect('select[name=prof_fumeur]', function () {
                            self.randomSelect('select[name=prof_ethnie]', function () {
                                self.randomSelect('select[name=prof_nationalite]', function () {
                                    self.randomSelect('#prof_langues1', function () {
                                        self.randomSelect('#prof_langues2', function () {
                                            self.client.setValue('#prof_cat_prof', 'Biologist').then(function () {
                                                self.randomSelect('select[name=prof_statut]', function () {
                                                    self.randomSelect('select[name=prof_enfants]', function () {
                                                        self.randomSelect('select[name=prof_enf_souhait]', function () {
                                                            self.randomSelect('select[name=prof_etudes]', function () {
                                                                self.randomSelect('select[name=prof_revenus]', function () {
                                                                    self.randomSelect('select[name=prof_taille]', function () {
                                                                        self.randomSelect('select[name=prof_poids]', function () {
                                                                            self.randomSelect('select[name=prof_silhouette]', function () {
                                                                                self.randomSelect('select[name=prof_cheveux]', function () {
                                                                                    self.randomSelect('select[name=description_stylecheveux]', function () {
                                                                                        self.randomSelect('select[name=prof_yeux]', function () {
                                                                                            self.client.click('#ultButton').then(function () {
                                                                                                self.step28();
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    });
};

/**
 * Step 28
 */
Match.prototype.step28 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/photo.php');

    this.waitText('.ultTxt2', 'Your profile photo', function () {
        self.step29();
    });
};


/**
 * Step 29
 */
Match.prototype.step29 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/signup/announce.php');

    this.waitText('.ultTxt2', 'Your personal ad:', function () {

        self.client.setValue('#un', 'I love you').then(function () {
            self.client.click('.ultLayerButtonSendGreen').then(function () {
                self.step30();
            });
        });
    });
};

/**
 * Step 30
 */
Match.prototype.step30 = function () {
    var self = this;

    // Option previous a session
    this.resumptionSession('http://www.matchaffinity.com/home/index.php');

    this.waitText('.i-btn-20', 'View your selection of matches', function () {
        self.client.click('.i-btn-20').then(function () {
            setTimeout(function () {
                self.step30();
            }, 10000);
        });
    });
};

/**
 * Step 31
 */
Match.prototype.step31 = function () {
    this.guerrillaApi.checkEmail(function (err, emails) {
        if (err) {
            console.log('Not messages to email'
                + err);
        } else {
            emails.forEach(function(email) {
                console.log(email.mail_from +
                    ' sent me an e-mail with the following subject: '
                    + mail.mail_subject);
                console.log(email);
            });
        }
    });
};

module.exports = Match;