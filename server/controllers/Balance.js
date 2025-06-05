const Transaction = require("../models/Transactions");

const logger = require("../logger").setup();

module.exports.getBalance = (_, res) => {
    Transaction.find({}, { "amount": 1 }, (err, transactions) => {
        if (err) {
            logger.error("An error occurred while getting balance: " + err);
            res.status(500).send({
                msg: err
            });
        }
        if (!transactions || transactions.length < 1) {
            res.status(200).send({
                balance: 0
            });
        } else {
            res.status(200).send({
                balance: transactions.reduce((accumulator, current) => accumulator + current.amount, 0)
            });
        }
    });
};