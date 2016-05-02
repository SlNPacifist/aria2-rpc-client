var inherits = require('inherits');
var BaseTransport = require('./base');

function WebsocketTransport(socket) {
  this.constructor.super_.apply(this);
  this._socket = socket;
  this._socket.onmessage = function onmessage(event) {
    this._emitter.emit('message', JSON.parse(event.data));
  }.bind(this);
}

inherits(WebsocketTransport, BaseTransport);

WebsocketTransport.prototype.send = function send(message) {
  this._socket.send(JSON.stringify(message));
}

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