var util = require('util');
var BaseTransport = require('./base');
var URL = require('url');
var formatMessageForAriaUrl = require('./util').formatMessageForAriaUrl;

function XhrTransport(url) {
  this.constructor.super_.apply(this);
  this.url = URL.parse(url);
}

util.inherits(XhrTransport, BaseTransport);

XhrTransport.prototype.send = function(message) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", function() {
    this._processMessage(request.responseText);
  });
  var ariaParams = formatMessageForAriaUrl(message);
  if (this.url.query) {
    this.url.search = this.url.query + '&' + ariaParams;
  } else {
    this.url.search = ariaParams;
  }
  // TODO: process close, timeout, error
  // TODO: add random parameter to ensure no caching
  request.open('GET', URL.format(this.url));
  request.send();
}

module.exports = XhrTransport;