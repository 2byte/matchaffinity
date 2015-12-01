var webdriverio = require('webdriverio');
var match = require('./match');
var Guerrilla = require('guerrilla-api');
var fs = require('fs');
var flatfile = require('flat-file-db');

switch (process.argv[2]) {

    case 'reset':
        fs.writeFile(__dirname + '/storage/cookie.json', JSON.stringify([]), function (status) {
            console.log('Reset is OK!');
        });
    break;

    case 'check_email':
        var Match = new match({webdriver_disable: true});

        Match.step31();
    break;

    default:
        // {socksProxy: '31.16.253.224:40362'}
        var Match = new match();
        //Match.client.url('http://2ip.ru');
        Match.prevSession = true;

        Match.step28();

        /*var db = flatfile(__dirname +'/storage/account.txt');

        db.on('open', function() {
            fs.writeFileSync(__dirname + '/storage/data.txt', db.get('email') +'|'+ db.get('password'));
        });*/
}