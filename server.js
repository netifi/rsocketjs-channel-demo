const {RSocketServer} = require('rsocket-core');
const RSocketWebsocketServer = require('rsocket-websocket-server').default;
const {Flowable, Single} = require('rsocket-flowable');

const getRequestHandler = () => {
  return {
    requestResponse: request => {
      console.log(request);
      return new Single(subscriber => {
        subscriber.onSubscribe();
        subscriber.onComplete({ data: 'goodbye'});
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