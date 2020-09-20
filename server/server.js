'use strict'

const {PeerRPCServer} = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

const {OrderBook} = require('./services/Orderbook');
const orderbook = new OrderBook();

const link = new Link({
    grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
    timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
    link.announce('createorder', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
    console.log(`Hit the key = ${key} with payload - ${JSON.stringify(payload)}`);
    switch (key) {
        case 'createorder':
            const order = payload.order;
            const trades = orderbook.executeTrade(order);
            handler.reply(null, {msg: `executed ${order.side} order - ${JSON.stringify(trades)} `});
            break;
        default:
            break;
    }
})
