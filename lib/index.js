module.exports = {
  JsonRpcClient: require('./json_rpc_client'),
  transport: {
    Xhr: require('./transport/xhr'),
    Jsonp: require('./transport/jsonp'),
    Websocket: require('./transport/websocket')
  }
}