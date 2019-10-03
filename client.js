const {RSocketClient} = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require("ws");
const {Flowable, Single} = require('rsocket-flowable');

const transportOptions = {
  url: 'ws://localhost:7777',
  wsCreator: (url) => {
    return new WebSocket(url);
  }
};

const setup = {
  keepAlive: 60000,
  lifetime: 180000,
  dataMimeType: 'text/plain',
  metadataMimeType: 'text/plain',
};

const transport = new RSocketWebsocketClient(transportOptions);
const client = new RSocketClient({setup, transport});

client.connect().subscribe({
  onComplete: socket => {
    console.log('Client connected to the RSocket server');

    socket.requestResponse({data: 'hello'})
    .subscribe({
      onSubscribe: sub => {
        console.log(`Client subscribed to server`);
      },
      onComplete: response => {
        console.log(response);
      }
    });

  }
});

