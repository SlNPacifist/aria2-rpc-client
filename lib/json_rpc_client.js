var serializer = require('jsonrpc-serializer');
var util = require('util');

function JsonRpcClient(transport) {
  this._lastId = 0;
  this._transport = transport;
  this._callbacks = {}
  this._processMessage = this._processMessage.bind(this);
  this._transport.addListener(this._processMessage);
}

JsonRpcClient.prototype._nextId = function nextId() {
  this._lastId += 1;
  return this._lastId;
}

JsonRpcClient.prototype.request = function request(name, params, callback) {
  var id = this._nextId();
  var message = serializer.request(id, name, params);
  if (util.isArray(message)) {
    var errorMessage = '' + message.concat('\n');
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

module.exports = JsonRpcClient;