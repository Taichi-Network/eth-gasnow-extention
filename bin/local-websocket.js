const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8005 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  ws.send(JSON.stringify({
    type: 'something',
    data: {
      rapid: 1000000000,
      fast: 1000000000,
      standard: 1000000000,
      slow: 1000000000,
    }
  }));
  setInterval(() => {
    ws.send(JSON.stringify({
      type: 'something',
      data: {
        rapid: 1000000000,
        fast: 1000000000,
        standard: 1000000000,
        slow: 1000000000,
      }
    }));
  }, 8000);
});
