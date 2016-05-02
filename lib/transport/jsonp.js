var inherits = require('inherits');
var BaseTransport = require('./base');
var URL = require('url');
var formatMessageForAriaUrl = require('./util').formatMessageForAriaUrl;

/**
 * Transport using old {@link https://en.wikipedia.org/wiki/JSONP JSONP} format
 *
 * @class
 * @implements Transport
 * @param {string} url
 */
function JsonpTransport(url) {
  this.constructor.super_.apply(this);
  /** @member {string} */
  this.url = URL.parse(url);
}

inherits(JsonpTransport, BaseTransport);

JsonpTransport.prototype.send = function(message) {
  var callbackName = 'callbackJsonpTransport' + Math.random().toString().slice(2);
  var queryParts = [];
  if (this.url.query) {
    queryParts.push(this.url.query);
  }
  queryParts.push('jsoncallback=' + callbackName);
  queryParts.push(formatMessageForAriaUrl(message));
  this.url.search = queryParts.join('&');
  // TODO: process timeout, error
  // TODO: add random parameter to ensure no caching
  var script = createScript(URL.format(this.url));
  window[callbackName] = function(data) {
    script.parentNode.removeChild(script);
    this._emitter.emit('message', data);
  }.bind(this);
  document.head.appendChild(script);
}

function createScript(src) {
  var res = document.createElement('script');
  res.setAttribute('src', src);
  res.setAttribute('type', 'text/javascript');
  return res;
}

module.exports = JsonpTransport;