# Aria2 RPC Client

This package is a basic client library for [Aria2](https://aria2.github.io/) JSON RPC. XML RPC not supported since this
library is targeted for browsers. This package can be used in node.js. It is pretty low-level and leaves transport
creation and error processing for user.

## Usage

### As a basis for your Aria2 library

This library do not perform transport creation and do not process transport errors. Most likely, you want to your own
library to do something like this:

 * create transport based on settings specified by user (and user does not want to know about kinds of transport - just
 address and port number)
 * create Aria2Client with specified transport
 * process transport errors (reconnect, try another transport, etc)

### As is

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
var client = aria.Aria2Client(transport);
client.call('aria2.getVersion', [], function(err, res) {...});
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

Omit buffer module since it is an optional dependency in base64 encoder. Using Buffer class shim in browser makes no
sense.