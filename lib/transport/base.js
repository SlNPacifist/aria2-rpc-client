var EventEmitter = require('events').EventEmitter;

var methods = ['addListener', 'listenerCount', 'listeners', 'on', 'once', 'removeAllListeners', 'removeListener'];
function BaseTransport() {
  this._emitter = new EventEmitter();
  var self = this;
  methods.forEach(function(name) {
    self[name] = function() {
      self._emitter[name].apply(self._emitter, arguments);
    }
  });
}

module.exports = BaseTransport;