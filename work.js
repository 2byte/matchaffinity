var webdriverio = require('webdriverio');
var match = require('./match');
var Guerrilla = require('guerrilla-api');

var Match = new match();

Match.prevSession = true;

Match.step19();