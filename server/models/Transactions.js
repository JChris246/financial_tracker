const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        require: true
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;