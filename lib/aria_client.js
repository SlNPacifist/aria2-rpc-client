var JsonRpcClient = require('./json_rpc_client')
var util = require('util');

function AriaClient(transport) {
  this.jsonRpcClient = new JsonRpcClient(transport);
  this._sendThrottledRequests = this._sendThrottledRequests.bind(this);
}

AriaClient.prototype.enableThrottling = function enableThrottling(timeout) {
  this._throttlingTimeout = timeout;
  this._throttledRequests = [];
}

AriaClient.prototype.disableThrottling = function disableThrottling() {
  this._sendThrottledRequests();
  delete this._throttlingTimeout;
  delete this._throttledRequests;
}

AriaClient.prototype._scheduleThrottling = function scheduleThrottling() {
  if (this._throttlingHandler) {
    return;
  }
  this._throttlingHandler = setTimeout(this._sendThrottledRequests, this._throttlingTimeout);
}

AriaClient.prototype._sendThrottledRequests = function sendThrottledRequests() {
  if (this._throttledRequests.length > 0) {
    var savedRequests = this._throttledRequests;
    this._throttledRequests = [];
    var requests = savedRequests.map(function(req) {
      var res = {
        methodName: req.methodName,
      }
      if (req.params) {
        res.params = req.params;
      }
      return res;
    });
    this.multicall(requests, function(err, res) {
      if (err) {
        // TODO: process multicall error
        return;
      }
      res.forEach(function(curResult, index) {
        if (util.isArray(curResult)) {
          savedRequests[index].callback(null, curResult[0]);
        } else {
          savedRequests[index].callback(curResult);
        }
      });
    });
  }
  clearTimeout(this._throttlingHandler);
  delete this._throttlingHandler;
}

AriaClient.prototype._throttleRequest = function throttleRequest(name, params, callback) {
  this._throttledRequests.push({
    methodName: name,
    params: params,
    callback: callback
  });
  this._scheduleThrottling();
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

function addProtoMethod(name, requestName, checkThrottling) {
  AriaClient.prototype[name] = function() {
    var callback = arguments[arguments.length - 1];
    var params = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      params.push(arguments[i]);
    }
    if (checkThrottling && this._throttlingTimeout) {
      this._throttleRequest(requestName, params, callback);
    } else {
      this.jsonRpcClient.request(requestName, params, callback);
    }
  }
}

ARIA2_METHODS.forEach(function(name) {
  addProtoMethod(name, 'aria2.' + name, true);
});

SYSTEM_METHODS.forEach(function(name) {
  addProtoMethod(name, 'system.' + name, false);
});

module.exports = AriaClient;