const Transaction = require("../models/Transactions")

module.exports.getBalance = (_, res) => {
    Transaction.find({}, (err, transactions) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                msg: err
            });
        }
        if (!transactions || transactions.length < 1)
            res.status(200).send({
                balance: 0
            });
        else res.status(200).send({
            balance: transactions.reduce((accumulator, current) => accumulator + current, 0)
        });
    });
};