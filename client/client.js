'use strict'

const {PeerRPCClient} = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const {Order} = require('./../shared/Order');

const link = new Link({
    grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const orders = [new Order(Math.floor(Math.random() * 100), 'sell', 11, 'BTC', 'XRP', 10, 0),
    new Order(Math.floor(Math.random() * 100), 'buy', 11, 'BTC', 'XRP', 12, 10)]

// setInterval(function () {
orders.forEach(order => {
    peer.request('createorder', {order: order}, {timeout: 10000}, (err, data) => {
        if (err) {
            console.error(err)
        }
        console.log(data)
    })
});
// }, 5000);