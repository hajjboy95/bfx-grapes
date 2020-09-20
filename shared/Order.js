'use strict'

class Order {
    constructor(id, side, price, baseAsset, quoteAsset, quantity, nonce) {
        this.id = id;
        this.side = side;
        this.price = price;
        this.executionTime = Date()
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.quantity = quantity;
        this.nonce = nonce; // protect against double spend or invalid orders from the same user (out of scope for this test)
    }
}

module.exports = {Order};