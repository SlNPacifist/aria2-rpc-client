# Aria2 RPC Client

This package is client library for [Aria2](https://aria2.github.io/) JSON RPC. XML RPC not supported since this library
is targeted for browsers. This package can be used in node.js. It is pretty low-level and leaves transport creation and
error processing for user.

## Usage

1. Load library
```
var aria = require('aria2-client');
```

2. Instantiate transport to be used with Aria2.
```
aria.transport.WebSocket.fromUrl('ws://localhost:6800/jsonrpc', function(err, transport) {
  if (err) {
    throw err;
  }
  // transport is ready
});
```

Aria2 supports 3 transports:

 * websocket
 * http
 * jsonp (old way to bypass same origin policy)

3. Instantiate client.
```
var client = aria.AriaClient(transport);
client.call('aria2.getVersion', [], console.log);
client.aria2.getVersion(console.log);
```

4. Process errors.
```
transport.on('error', function(err) {
  client.cancelAllRequests();
  // do not use client anymore, reinstantiate transport.
});
```

## Usage in browser

This project can be [browserified](http://browserify.org/) pretty nicely.
```
browserify ./lib/index.js -u buffer -o aria.js -s aria
```