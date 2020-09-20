'use strict'

class Trade {
    constructor(id, sellId, buyId, baseAsset, quoteAsset) {
        this.id = id;
        this.sellId = sellId;
        this.buyId = buyId;
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.price = null;
        this.quantity = null
    }

    updatePrice(price) {
        this.price = price;
    }

    updateQuantity(quantity) {
        this.quantity = quantity;
    }

    updatePriceAndQuantity(price, quantity) {
        this.updatePrice(price);
        this.updateQuantity(quantity);
    }
}

module.exports = {Trade};