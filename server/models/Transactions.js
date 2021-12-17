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
    },
    type: { // whether income or spend (true - income, false - spend)
        type: Boolean,
        require: true
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;