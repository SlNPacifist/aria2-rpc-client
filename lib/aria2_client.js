var serializer = require('jsonrpc-serializer');
var errors = require('./errors');

/**
 * Client class to perform requests to Aria2 instance
 *
 * @class
 * @param {Transport} transport
 */
function Aria2Client(transport) {
  this._lastId = 0;
  this._transport = transport;
  this._callbacks = {}
  this._processMessage = this._processMessage.bind(this);
  this._transport.on('message', this._processMessage);
  this.cancelAllRequests = this.cancelAllRequests.bind(this);
}

Aria2Client.prototype._nextId = function nextId() {
  this._lastId += 1;
  return this._lastId;
}

/**
 * Perform request to Aria2 instance. See {@link https://aria2.github.io/manual/en/html/aria2c.html#methods} for a list
 * of available methods.
 *
 * For example, request('aria2.getVersion', [], callback) will do
 * callback(null, {version: '...', enabledFeatures: '...'})
 *
 * @param {string} name
 * @param {Array} params
 * @param {function} callback
 */
Aria2Client.prototype.request = function request(name, params, callback) {
  var id = this._nextId();
  var message = serializer.requestObject(id, name, params);
  if (Array.isArray(message)) {
    throw new Error(message[0]);
  }
  this._callbacks[id] = callback;
  this._transport.send(message);
}

Aria2Client.prototype._processMessage = function processMessage(message) {
  var message = serializer.deserializeObject(message);
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

/**
 * Cancels every pending request. Every callback will receive RequestCanceledError.
 */
Aria2Client.prototype.cancelAllRequests = function cancelAllRequests() {
  for (var id in this._callbacks) {
    this._callbacks[id](new errors.RequestCanceledError());
  }
  this._callbacks = {};
}

module.exports = Aria2Client;