const {RSocketServer} = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const {Flowable, Single} = require('rsocket-flowable');

const getRequestHandler = () => {
  return {
    requestChannel: clientFlowable => {
      let subscription;
      let responses = ['g', 'h', 'i'];
      responses = responses.map(res => {
        return {
          data: res
        };
      });
      return new Flowable(subscriber => {
        subscriber.onSubscribe();
        clientFlowable.subscribe({
          onSubscribe: sub => {
            subscription = sub;
            console.log('Server subscribed to client channel');
            subscription.request(1);
          },
          onNext: clientRequest => {
            console.log(clientRequest);
            subscription.request(1);
            if (responses.length) {
              subscriber.onNext(responses.shift());
            }
          },
          onComplete: () => {
            console.log('Server received end of client stream');
            while(responses.length) {
              subscriber.onNext(responses.shift());
            }
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