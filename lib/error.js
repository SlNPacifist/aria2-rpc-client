var errors = require('jsonrpc-serializer').err;
var inherits = require('inherits');

RequestCanceledError  = function RequestCanceledError() {
    this.name    = 'RequestCanceledError';
    this.message = 'Method call was canceled.';
    this.code    = -31999;
    this.data    = Array.prototype.slice.call(arguments).splice();
};
inherits(RequestCanceledError, errors.JsonRpcError);

for (var err in errors) {
  exports[err] = errors[err];
}
exports.RequestCanceledError = RequestCanceledError;