var serializer = require('jsonrpc-serializer');
var errors = require('./errors');

function JsonRpcClient(transport) {
  this._lastId = 0;
  this._transport = transport;
  this._callbacks = {}
  this._processMessage = this._processMessage.bind(this);
  this._transport.on('message', this._processMessage);
  this.cancelAllRequests = this.cancelAllRequests.bind(this);
}

JsonRpcClient.prototype._nextId = function nextId() {
  this._lastId += 1;
  return this._lastId;
}

JsonRpcClient.prototype.request = function request(name, params, callback) {
  var id = this._nextId();
  var message = serializer.request(id, name, params);
  if (Array.isArray(message)) {
    throw new Error(message[0]);
  }
  this._callbacks[id] = callback;
  this._transport.send(message);
}

JsonRpcClient.prototype._processMessage = function processMessage(message) {
  var message = serializer.deserialize(message);
  if (message instanceof Error) {
    // TODO: add error handler for messages that cannot be processed
    return;
  }
  var id = message.payload.id;
  var callback = this._callbacks[id];
  if (!callback) {
    // TODO: add error handler for messages without callback
    return;
  }
  switch (message.type) {
    case 'success':
      callback(null, message.payload.result);
      break;
    case 'error':
      callback(message.payload.error);
      break;
    default:
      // TODO: add error handler for messages of unknown type
      break;
  }
  delete this._callbacks[id];
}

JsonRpcClient.prototype.cancelAllRequests = function cancelAllRequests() {
  for (var id in this._callbacks) {
    this._callbacks[id](new errors.RequestCanceledError());
  }
  this._callbacks = {};
}

module.exports = JsonRpcClient;