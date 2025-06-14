const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: { // whether income or spend (true - income, false - spend)
        type: Boolean,
        required: true
    },
    date: { // transaction date in seconds
        type: Number,
        required: true
    },
    // this field probably only make sense for fiat currency
    category: {
        type: String,
    },
    assetType: {
        type: String, // cash, stock, crypto
        required: true,
        default: "cash"
    },
    // for cash this is USD, EUR, GPD etc,
    // for crypto this is BTC, ETH, XRP etc
    // for stock this is AAPL, MSFT, GOOGL etc
    currency: {
        type: String,
        required: true,
        default: "usd"
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;