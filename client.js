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
  metadataMimeType: 'application/json',
};

const transport = new RSocketWebsocketClient(transportOptions);
const client = new RSocketClient({setup, transport});

client.connect().subscribe({
  onComplete: socket => {
    console.log('Client connected to the RSocket server');

    const clientRequests = ['a', 'b', 'c'];

    const channel1Requests = clientRequests.map(req => {
      return {
        data: req,
        metadata: JSON.stringify({ group: 1 })
      };
    });

    const channel2Requests = clientRequests.map(req => {
      return {
        data: req,
        metadata: JSON.stringify({ group: 2 })
      };
    });

    socket.requestChannel(Flowable.just(...channel1Requests))
    .subscribe({
      onSubscribe: sub => {
        subscription = sub;
        console.log(`Client is establishing Channel 1`);
        subscription.request(0x7fffffff);
      },
      onNext: response => {
        console.log(`Channel 1: ${response.data}`);
      },
      onComplete: () => {
        console.log(`Channel 1 received end of server stream`);
      },
      onError: err => {
        console.error(err);
      }
    });

    socket.requestChannel(Flowable.just(...channel2Requests))
    .subscribe({
      onSubscribe: sub => {
        subscription = sub;
        console.log(`Client is establishing Channel 2`);
        subscription.request(0x7fffffff);
      },
      onNext: response => {
        console.log(`Channel 2: ${response.data}`);
      },
      onComplete: () => {
        console.log(`Channel 2 received end of server stream`);
      },
      onError: err => {
        console.error(err);
      }
    });

  }
});

