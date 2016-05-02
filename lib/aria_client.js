var JsonRpcClient = require('./json_rpc_client')
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

function createCallSynonym(requestName) {
  return function() {
    var callback = arguments[arguments.length - 1];
    var params = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      params.push(arguments[i]);
    }
    this.jsonRpcClient.request(requestName, params, callback);
  }
}

function AriaClient(transport) {
  this.jsonRpcClient = new JsonRpcClient(transport);
  var self = this;
  this.aria2 = {};
  ARIA2_METHODS.forEach(function(name) {
    self.aria2[name] = createCallSynonym('aria2.' + name, true).bind(self);
  });

  this.system = {};
  SYSTEM_METHODS.forEach(function(name) {
    self.system[name] = createCallSynonym('system.' + name, false).bind(self);
  });
}

AriaClient.prototype.cancelAllRequests = function cancelAllRequests() {
  this.jsonRpcClient.cancelAllRequests();
  if (this._throttlingTimeout) {
    this._throttledRequests.forEach(function(request) {
      request.callback(new errors.RequestCanceledError());
    });
  }
  this._throttledRequests = [];
}

module.exports = AriaClient;