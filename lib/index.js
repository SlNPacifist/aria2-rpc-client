module.exports = {
  Aria2Client: require('./aria2_client'),
  transport: {
    Xhr: require('./transport/xhr'),
    Jsonp: require('./transport/jsonp'),
    Websocket: require('./transport/websocket')
  }
}