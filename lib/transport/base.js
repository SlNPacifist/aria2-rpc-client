function BaseTransport() {
  this._listeners = [];
  this._processMessage = this._processMessage.bind(this);
}

BaseTransport.prototype.addListener = function addListener(listener) {
  this._listeners.push(listener);
}

BaseTransport.prototype._processMessage = function processMessage(message) {
  this._listeners.forEach(function(listener) {
    listener(message);
  });
}

module.exports = BaseTransport;