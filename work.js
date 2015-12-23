var webdriverio = require('webdriverio');
var match = require('./match');
var fs = require('fs');
var flatfile = require('flat-file-db');
var request = require('request');
var tempmail = require('tempmail.js');

switch (process.argv[2]) {

    case 'reset':
        fs.writeFile(__dirname + '/storage/cookie.json', JSON.stringify([]), function (status) {
            console.log('Reset is OK!');
        });
    break;

    case 'check_email':
        var Match = new match();

        Match.prevSession = true;

        Match.step31();
    break;

    case 'test':
        var account = new tempmail('bgzlcv@yhg.biz');

        console.log(account.address);

        account.getMail(function (messages) {
            if (messages.length) {
                console.log('Mail is found');

                var getLink = messages[0].text_only.match(/(https\:\/\/tk\d*\.info\.lnkml\.com\/r\/\?id.[^"]+)/g);

                console.log(getLink);
            } else {
                console.log('Empty');
            }
        });
    break;

    default:
        var Match = new match();
        //Match.prevSession = true;

        Match.step1();
}