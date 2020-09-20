const {describe} = require('mocha');
const assert = require('assert')
const {OrderBook} = require('./../services/Orderbook');
const {Order} = require('./../../shared/Order');
const {Trade} = require('./../Trade');
describe('order book', () => {
    this.BUY = 'buy';
    this.SELL = 'sell';
    this.tradePair = 'BTC/USDT';

    describe('Trade Execution', () => {
        it('should intitiate queue if none exist for given tradepair/side/price', () => {
            const orderbook = new OrderBook()
            const order = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const trades = orderbook.executeTrade(order)
            assert.ok(orderbook.tradePairs[this.tradePair])
            assert.deepStrictEqual(orderbook.tradePairs[this.tradePair][this.BUY][10][0], order)
            assert.equal(trades.length, 0)
        });

        it('should add orders with the same price within the same bucket', () => {
            const orderbook = new OrderBook()

            const order1 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const order2 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);

            const tradesOne = orderbook.executeTrade(order1)
            const tradesTwo = orderbook.executeTrade(order2);

            assert.ok(orderbook.tradePairs[this.tradePair]);
            assert.equal(orderbook.tradePairs[this.tradePair][this.BUY][10].length, 2);
            assert.equal(Object.keys(orderbook.tradePairs).length, 1);
            assert.deepStrictEqual(orderbook.tradePairs[this.tradePair][this.BUY][10][0], order1);
            assert.deepStrictEqual(orderbook.tradePairs[this.tradePair][this.BUY][10][1], order2);

            assert.equal(tradesOne.length, 0)
            assert.equal(tradesTwo.length, 0)
        });

        it("should add multiple orders of the same tradepair/side to differnt buckets if price aren't the same", () => {
            const orderbook = new OrderBook()

            const order1 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const order2 = new Order((Math.floor(Math.random() * 100)), this.BUY, 11, 'BTC', 'USDT', 5, 0);

            const tradesOne = orderbook.executeTrade(order1)
            const tradesTwo = orderbook.executeTrade(order2);


            assert.ok(orderbook.tradePairs[this.tradePair]);
            assert.equal(orderbook.tradePairs[this.tradePair][this.BUY][10].length, 1);
            assert.equal(orderbook.tradePairs[this.tradePair][this.BUY][11].length, 1);
            assert.equal(Object.keys(orderbook.tradePairs).length, 1);

            assert.deepStrictEqual(orderbook.tradePairs[this.tradePair][this.BUY][10][0], order1);
            assert.deepStrictEqual(orderbook.tradePairs[this.tradePair][this.BUY][11][0], order2);

            assert.equal(tradesOne.length, 0)
            assert.equal(tradesTwo.length, 0)
        });

        it("Should create new entry in the tradepairs map for orders with different trading pair", () => {
            const orderbook = new OrderBook()

            const order1 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const order2 = new Order((Math.floor(Math.random() * 100)), this.BUY, 11, 'LEO', 'USDT', 5, 0);

            const tradesOne = orderbook.executeTrade(order1)
            const tradesTwo = orderbook.executeTrade(order2);

            assert.ok(orderbook.tradePairs[this.tradePair]);
            assert.ok(orderbook.tradePairs['LEO/USDT']);
            assert.equal(orderbook.tradePairs[this.tradePair][this.BUY][10].length, 1);
            assert.equal(orderbook.tradePairs['LEO/USDT'][this.BUY][11].length, 1);
            assert.equal(Object.keys(orderbook.tradePairs).length, 2);
            assert.equal(tradesOne.length, 0)
            assert.equal(tradesTwo.length, 0)
        });

        it("should fully fill 2 orders with same quantity and price", () => {
            const orderbook = new OrderBook()
            const order1 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const order2 = new Order((Math.floor(Math.random() * 100)), this.SELL, 10, 'BTC', 'USDT', 5, 0);

            const trades1 = orderbook.executeTrade(order1)
            const trades2 = orderbook.executeTrade(order2);

            assert.ok(orderbook.tradePairs[this.tradePair]);

            assert.equal(trades1.length, 0);
            assert.equal(trades2.length, 1);

            assert.equal(trades2[0].sellId, order2.id);
            assert.equal(trades2[0].buyId, order1.id);
            assert.equal(trades2[0].price, 10);
            assert.equal(trades2[0].quantity, 5);
        });

        it('should partially match 2 orders', () => {

            const orderbook = new OrderBook()
            const order1 = new Order((Math.floor(Math.random() * 100)), this.BUY, 10, 'BTC', 'USDT', 5, 0);
            const order2 = new Order((Math.floor(Math.random() * 100)), this.SELL, 10, 'BTC', 'USDT', 4, 0);

            const trades1 = orderbook.executeTrade(order1)
            const trades2 = orderbook.executeTrade(order2);

            assert.ok(orderbook.tradePairs[this.tradePair]);
            assert.equal(orderbook.tradePairs[this.tradePair][this.BUY][10].length, 1);

            assert.equal(trades1.length, 0);
            assert.equal(trades2.length, 1);

            assert.equal(trades2[0].sellId, order2.id);
            assert.equal(trades2[0].buyId, order1.id);
            assert.equal(trades2[0].price, 10);
            assert.equal(trades2[0].quantity, 4);
        });
    });

//    due to lack of time should implment a test to check for when the trade range doesnt match due to price being out of range. and some others tests. around the core trading engine

});