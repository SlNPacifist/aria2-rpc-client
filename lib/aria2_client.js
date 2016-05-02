var serializer = require('jsonrpc-serializer');
var errors = require('./errors');

var ARIA2_METHODS = [
  'addUri', 'addTorrent', 'addMetalink', 'remove', 'forceRemove', 'pause', 'pauseAll', 'forcePause',
  'forcePauseAll', 'unpause', 'unpauseAll', 'tellStatus', 'getUris', 'getFiles', 'getPeers',
  'getServers', 'tellActive', 'tellWaiting', 'tellStopped', 'changePosition', 'changeUri',
  'getOption', 'changeOption', 'getGlobalOption', 'changeGlobalOption', 'getGlobalStat',
  'purgeDownloadResult', 'removeDownloadResult', 'getVersion', 'getSessionInfo', 'shutdown',
  'forceShutdown', 'saveSession'
];

var SYSTEM_METHODS = ['multicall', 'listMethods'];

function createRequestAlias(requestName) {
  return function() {
    var callback = arguments[arguments.length - 1];
    var params = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      params.push(arguments[i]);
    }
    this.request(requestName, params, callback);
  }
}

function Aria2Client(transport) {
  this._lastId = 0;
  this._transport = transport;
  this._callbacks = {}
  this._processMessage = this._processMessage.bind(this);
  this._transport.on('message', this._processMessage);
  this.cancelAllRequests = this.cancelAllRequests.bind(this);

  this.aria2 = {};
  ARIA2_METHODS.forEach(function(name) {
    this.aria2[name] = createRequestAlias('aria2.' + name, true).bind(this);
  }.bind(this));

  this.system = {};
  SYSTEM_METHODS.forEach(function(name) {
    this.system[name] = createRequestAlias('system.' + name, false).bind(this);
  }.bind(this));
}

Aria2Client.prototype._nextId = function nextId() {
  this._lastId += 1;
  return this._lastId;
}

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

Aria2Client.prototype.cancelAllRequests = function cancelAllRequests() {
  for (var id in this._callbacks) {
    this._callbacks[id](new errors.RequestCanceledError());
  }
  this._callbacks = {};
}

module.exports = Aria2Client;