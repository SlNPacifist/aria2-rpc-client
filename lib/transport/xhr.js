var inherits = require('inherits');
var BaseTransport = require('./base');
var URL = require('url');
var formatMessageForAriaUrl = require('./util').formatMessageForAriaUrl;

/**
 * Transport that uses XMLHttpRequest to send messages
 *
 * @class
 * @implements Transport
 * @param {string} url
 */
function XhrTransport(url) {
  this.constructor.super_.apply(this);
  /** @member {string} */
  this.url = URL.parse(url);
}

/**
 * Xhr-related error could be fired for this transport. Most likely error is caused by same origin policy, connection
 * issues or large request (url length in request is limited).
 *
 * @event XhrTransport#error
 * @type {Object}
 */

inherits(XhrTransport, BaseTransport);

XhrTransport.prototype.send = function(message) {
  // TODO: check if POST requests are possible
  var request = new XMLHttpRequest();
  var self = this;
  request.addEventListener("load", function() {
    self._emitter.emit('message', JSON.parse(request.responseText));
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
  request.onerror = processError;
  request.open('GET', URL.format(this.url));
  request.send();
  return this;
}

module.exports = XhrTransport;