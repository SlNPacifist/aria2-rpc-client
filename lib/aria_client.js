var JsonRpcClient = require('./json_rpc_client')

function AriaClient(transport) {
  this.jsonRpcClient = new JsonRpcClient(transport);
}

var ARIA2_METHODS = [
  'addUri', 'addTorrent', 'addMetalink', 'remove', 'forceRemove', 'pause', 'pauseAll', 'forcePause',
  'forcePauseAll', 'unpause', 'unpauseAll', 'tellStatus', 'getUris', 'getFiles', 'getPeers',
  'getServers', 'tellActive', 'tellWaiting', 'tellStopped', 'changePosition', 'changeUri',
  'getOption', 'changeOption', 'getGlobalOption', 'changeGlobalOption', 'getGlobalStat',
  'purgeDownloadResult', 'removeDownloadResult', 'getVersion', 'getSessionInfo', 'shutdown',
  'forceShutdown', 'saveSession'
];

var SYSTEM_METHODS = ['multicall', 'listMethods'];

function addProtoMethod(name, requestName) {
  AriaClient.prototype[name] = function() {
    var callback = arguments[arguments.length - 1];
    var params = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      params.push(arguments[i]);
    }
    this.jsonRpcClient.request(requestName, params, callback);
  }
}

ARIA2_METHODS.forEach(function(name) {
  addProtoMethod(name, 'aria2.' + name)
});

SYSTEM_METHODS.forEach(function(name) {
  addProtoMethod(name, 'system.' + name);
});

module.exports = AriaClient;