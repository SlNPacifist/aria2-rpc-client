/**
 * Interface that transport must implement. It mocks some of node's EventEmitter methods.
 * @interface Transport
 */

/**
 * Send message represented as object. Should be {@link http://www.jsonrpc.org/specification#request_object request object}.
 * {@link http://www.jsonrpc.org/specification#notification Notifications} are not supported yet.
 *
 * @function Transport#send
 * @param {object} message
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Add event listener for event
 *
 * @function Transport#on
 * @param {string} name
 * @param {function} callback
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Alias for {@link Transport#on}
 *
 * @function Transport#addListener
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Add event listener for event and remove it after event is fired
 *
 * @function Transport#once
 * @param {string} name
 * @param {function} callback
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Remove all listeners for event
 *
 * @function Transport#removeAllListeners
 * @param {string} name
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Remove specified listener for event
 *
 * @function Transport#removeLitener
 * @param {string} name
 * @param {function} listener
 * @returns {Transport} object instance so calls can be chained
 */

/**
 * Message from server. Most likely {@link http://www.jsonrpc.org/specification#response_object response object} from
 * server. {@link http://www.jsonrpc.org/specification#notification Notifications} are not supported yet.
 *
 * @event Transport#message
 * @type {Object}
 */

var EventEmitter = require('events').EventEmitter;
var methods = ['addListener', 'on', 'once', 'removeAllListeners', 'removeListener'];
/**
 * Helper base class for transport. It generates EventEmitter methods for {@link Transport} interface by instantiating
 * new EventEmitter as _emitter.
 * @class
 * @abstract
 */
function BaseTransport() {
  this._emitter = new EventEmitter();
  var self = this;
  methods.forEach(function(name) {
    self[name] = function() {
      self._emitter[name].apply(self._emitter, arguments);
      return self;
    }
  });
}

module.exports = BaseTransport;