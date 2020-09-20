const {Trade} = require('../Trade');

class OrderBook {

    constructor() {
        this.SELL = 'sell';
        this.BUY = 'buy';

        /* arrange tradePairs according to the side and have each price as a bucket of orders for quick lookup of price:orders

            {[
            "BTC/USDT": {
                "buy": {
                    "price": "[queue of orders]"
                },
                "sell": {
                    "price": "[queue of orders]"
                }
            }, ...]
           }
        */
        this.tradePairs = {};
    }

    executeTrade(order) {
        let trades = []
        if (order.side === this.BUY) {
            trades = this.matchBuyWithSellOrders(order);
        } else if (order.side === this.SELL) {
            trades = this.matchSellWithBuyOrders(order);
        }

        // if order wasn't fully filled then add a new order to the order book.
        if (order.quantity > 0) {
            this.addOrder(order);
        }

        return trades;
    }

    matchBuyWithSellOrders(buyOrder) {
        const tradePair = `${buyOrder.baseAsset}/${buyOrder.quoteAsset}`;
        const currentBestSalePrices = this.getBestSalePrice(tradePair);

        let trades = [];

        for (let i = 0; i < currentBestSalePrices.length; i++) {
            if (buyOrder.quantity === 0) break;
            else if (currentBestSalePrices[i] > buyOrder.price) continue;
            let sellOrdersToRemove = {};
            // let sellOrdersToRemove = new Map();
            const matchingPricesTrades = this.tradePairs[tradePair][this.SELL][currentBestSalePrices[i]]
            for (let j = 0; j < matchingPricesTrades.length; j++) {
                const sellOrder = matchingPricesTrades[j];
                const remainderToFill = sellOrder.quantity - buyOrder.quantity;
                const trade = new Trade(Math.random(), sellOrder.id, buyOrder.id, buyOrder.baseAsset, buyOrder.quoteAsset);

                if (remainderToFill < 0) {
                    trade.updatePriceAndQuantity(sellOrder.price, sellOrder.quantity);
                    trades.push(trade);
                    sellOrdersToRemove[sellOrder.price] = i
                    // sellOrdersToRemove.set(sellOrder.price, i);
                    buyOrder.quantity = Math.abs(remainderToFill);
                    sellOrder.quantity = 0;
                } else if (remainderToFill > 0) {
                    trade.updatePriceAndQuantity(sellOrder.price, buyOrder.quantity);
                    trades.push(trade);
                    sellOrder.quantity = remainderToFill;
                    buyOrder.quantity = 0;
                } else {
                    trade.updatePriceAndQuantity(sellOrder.price, buyOrder.quantity);
                    trades.push(trade);
                    sellOrdersToRemove[sellOrder.price] = i;
                    buyOrder.quantity = 0;
                    sellOrder.quantity = 0;
                }
            }
            Object.keys(sellOrdersToRemove).forEach(price => {
                this.tradePairs[tradePair][this.SELL][price].splice(sellOrdersToRemove[price], 1)
            });
        }
        return trades;
    }

    matchSellWithBuyOrders(sellOrder) {
        const tradePair = `${sellOrder.baseAsset}/${sellOrder.quoteAsset}`;
        const currentBestBuyPrices = this.getBestBuyPrice(tradePair);

        let trades = [];
        for (let i = 0; i < currentBestBuyPrices; i++) {
            if (sellOrder.quantity === 0) break;
            else if (currentBestBuyPrices[i] > sellOrder.price) continue;

            const buyOrdersToRemove = {};
            const matchingPricesTrades = this.tradePairs[tradePair][this.BUY][currentBestBuyPrices[i]]

            for (let j = 0; j < matchingPricesTrades.length; j++) {
                const buyOrder = matchingPricesTrades[j];
                const remainderToFill = sellOrder.quantity - buyOrder.quantity;
                const trade = new Trade(Math.random(), sellOrder.id, buyOrder.id, buyOrder.baseAsset, buyOrder.quoteAsset);

                if (remainderToFill < 0) {
                    trade.updatePriceAndQuantity(sellOrder.price, sellOrder.quantity);
                    trades.push(trade);
                    buyOrder.quantity = Math.abs(remainderToFill);
                    sellOrder.quantity = 0;
                } else if (remainderToFill > 0) {
                    trade.updatePriceAndQuantity(buyOrder.price, sellOrder.quantity);
                    trades.push(trade);
                    buyOrder.quantity = 0;
                    sellOrder.quantity = remainderToFill;
                    buyOrdersToRemove[buyOrder.price] = i;
                } else {
                    trade.updatePriceAndQuantity(buyOrder.price, sellOrder.quantity);
                    trades.push(trade);
                    buyOrder.quantity = 0
                    sellOrder.quantity = 0
                    buyOrdersToRemove[buyOrder.price] = i
                }
            }
            Object.keys(buyOrdersToRemove).forEach(price => {
                this.tradePairs[tradePair][this.BUY][price].splice(buyOrdersToRemove[price], 1)
            });
        }
        return trades;
    }

    addOrder(order) {
        const tradePair = `${order.baseAsset}/${order.quoteAsset}`;
        if (!(tradePair in this.tradePairs)) this.tradePairs[tradePair] = {};
        if (!(order.side in this.tradePairs[tradePair])) this.tradePairs[tradePair][order.side] = {};
        if (!(order.price in this.tradePairs[tradePair][order.side])) this.tradePairs[tradePair][order.side][order.price] = [];

        this.tradePairs[tradePair][order.side][order.price].push(order);
    }

    getBestBuyPrice(tradePair) {
        return this.getCurrentBestPrices(tradePair, this.BUY).sort((a, b) => b - a);
    }

    getBestSalePrice(tradePair) {
        return this.getCurrentBestPrices(tradePair, this.SELL).sort((a, b) => b - a);
    }

    getCurrentBestPrices(tradePair, side) {
        if (this.tradePairs[tradePair] && this.tradePairs[tradePair][side]) {
            return Object.keys(this.tradePairs[tradePair][side]);
        } else {
            return [];
        }
    }
}

module.exports = {OrderBook};