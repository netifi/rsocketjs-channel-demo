const {RSocketServer} = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const {Flowable, Single} = require('rsocket-flowable');

let responses = [
  {
    data: 'I\'m message 1 in group 1',
    metadata: { group: 1 }
  },
  {
    data: 'I\'m message 1 in group 2',
    metadata: { group: 2 }
  },
  {
    data: 'I\'m message 2 in group 1',
    metadata: { group: 1 }
  },
  {
    data: 'I\'m message 2 in group 2',
    metadata: { group: 2 }
  },
  {
    data: 'I\'m message 3 in group 2',
    metadata: { group: 2 }
  }
];

const getNextResponseForGroup = group => {
  const nextResponseIndex = responses.findIndex(res => res.metadata.group === group);
  if (nextResponseIndex > -1) {
    const resArray = responses.splice(nextResponseIndex, 1);
    return {
      ...resArray[0],
      metadata: JSON.stringify(resArray[0].metadata)
    };
  }
};

const getRequestHandler = () => {
  return {
    requestChannel: clientFlowable => {
      let subscription;
      return new Flowable(subscriber => {
        subscriber.onSubscribe();
        let groupId;
        clientFlowable.subscribe({
          onSubscribe: sub => {
            subscription = sub;
            console.log('Server subscribed to client channel');
            subscription.request(1);
          },
          onNext: clientRequest => {
            console.log(clientRequest);
            if (!groupId) {
              const metadata = JSON.parse(clientRequest.metadata);
              groupId = metadata.group;
            }
            subscription.request(1);
            const res = getNextResponseForGroup(groupId);
            if (res) {
              subscriber.onNext(res);
            }
            else {
              subscriber.onComplete();
            }
          },
          onComplete: () => {
            console.log('Server received end of client stream');
            let res;
            do {
              res = getNextResponseForGroup(groupId);
              if (res) {
                subscriber.onNext({
                  ...res,
                  metadata: JSON.stringify(res.metadata)
                });
              }
            }
            while(res);
            subscriber.onComplete();
          }
        });
      });
    }
  }
};

const transport = new RSocketWebsocketServer({
  host: 'localhost',
  port: 7777
});
const server = new RSocketServer({transport, getRequestHandler});
server.start();