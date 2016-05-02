var inherits = require('inherits');
var BaseTransport = require('./base');

/**
 * Transport that uses Websocket to send messages. This transport is usually instantiated using
 * {@link WebsocketTransport.fromUrl} method.
 *
 * @class
 * @implements Transport
 * @param {WebSocket} socket
 */
function WebsocketTransport(socket) {
  this.constructor.super_.apply(this);
  this._socket = socket;
  this._socket.onmessage = function onmessage(event) {
    this._emitter.emit('message', JSON.parse(event.data));
  }.bind(this);
  // TODO: emit any errors from _socket
}

inherits(WebsocketTransport, BaseTransport);

WebsocketTransport.prototype.send = function send(message) {
  this._socket.send(JSON.stringify(message));
  return this;
}

/**
 * Instantiates websocket transport form supplied url. Instantiated transport is supplied to callback after 'open'
 * event. Callback is a function(err, transport). Any error that happened to created Webosocket before 'open' event
 * will be passed to callback error. If no error happened, callback will be called as callback(null, transport).
 *
 * @param {string} url
 * @param {function} callback
 */
WebsocketTransport.fromUrl = function fromUrl(url, callback) {
  try {
    var socket = new WebSocket(url);
  } catch (error) {
    return callback(error);
  }

  function clearListeners() {
    socket.onopen = null;
    socket.onerror = null;
  }

  socket.onopen = function() {
    clearListeners();
    callback(null, new WebsocketTransport(socket));
  }
  socket.onerror = function(error) {
    clearListeners();
    callback(error);
  }
}

module.exports = WebsocketTransport;