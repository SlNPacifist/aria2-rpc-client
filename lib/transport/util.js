var base64 = require('js-base64').Base64;

function formatMessageForAriaUrl(message) {
  message = JSON.parse(message);
  return Object.keys(message).map(function(key) {
    if (key == 'params') {
      var val = base64.encode(JSON.stringify(message[key]))
    } else {
      var val = message[key].toString();
    }
    return [key, val].join('=');
  }).join('&');
}

module.exports = {
  formatMessageForAriaUrl: formatMessageForAriaUrl
}