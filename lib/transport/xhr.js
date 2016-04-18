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
  var self = this;
  request.addEventListener("load", function() {
    self._emitter.emit('message', request.responseText);
  });
  var ariaParams = formatMessageForAriaUrl(message);
  if (this.url.query) {
    this.url.search = this.url.query + '&' + ariaParams;
  } else {
    this.url.search = ariaParams;
  }
  // TODO: process close, timeout, error
  // TODO: add random parameter to ensure no caching
  function processError(e) {
    self._emitter.emit('error', e);
  }
  request.ontimeout = processTimeout;
  request.open('GET', URL.format(this.url));
  request.send();
}

module.exports = XhrTransport;