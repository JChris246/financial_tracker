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
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;