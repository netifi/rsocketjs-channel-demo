# RSocketJS Channel Demo

This project demonstrates a simple requestChannel setup over a websocket between two Node servers.

## Setup

`yarn` to install

`yarn server` and `yarn client` will start the server and client, respectively.

## How it works

Once connected to the server, the client hands off a Flowable of requests. The server receives the Flowable, subscribes to it, and requests a payload from the Flowable. The server also returns a Flowable to the client. As client payloads arrive at the server, the server calls `subscriber.onNext();` to provide responses via the Flowable it returned to the client. Finally, as both the client and server run out of requests and responses, their subscriber's onComplete methods are called.