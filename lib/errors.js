var errors = require('jsonrpc-serializer').err;
var util = require('util');

RequestCanceledError  = function RequestCanceledError() {
    this.name    = 'RequestCanceledError';
    this.message = 'Method call was canceled.';
    this.code    = -31999;
    this.data    = Array.prototype.slice.call(arguments).splice();
};

util.inherits(RequestCanceledError, errors.JsonRpcError);
module.exports =  {
  RequestCanceledError: RequestCanceledError
}