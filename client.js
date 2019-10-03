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
  dataMimeType: 'binary',
  metadataMimeType: 'binary',
};

const transport = new RSocketWebsocketClient(transportOptions);
const client = new RSocketClient({setup, transport});

client.connect().subscribe({
  onComplete: socket => {
    console.log('Client connected to the RSocket server');

    let clientRequests = ['a', 'b', 'c', 'd', 'e', 'f'];
    clientRequests = clientRequests.map(req => {
      return {
        data: req
      };
    });
    let subscription;

    socket.requestChannel(Flowable.just(...clientRequests))
    .subscribe({
      onSubscribe: sub => {
        subscription = sub;
        console.log(`Client is establishing a channel`);
        subscription.request(1000000);
      },
      onNext: response => {
        console.log(response);
      },
      onComplete: () => {
        console.log(`Client received end of server stream`);
      }
    });

  }
});

