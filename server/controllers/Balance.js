const logger = require("../logger").setup();
const { getDatabase } = require("../db/index");

module.exports.getBalance = (_, res) => {
    getDatabase().getAllTransactionAmounts(
        transactions => {
            // TODO: there may be an optimized query for this (especially in sql)
            if (!transactions || transactions.length < 1) {
                res.status(200).send({ balance: 0 });
            } else {
                res.status(200).send({
                    balance: transactions.reduce((accumulator, current) => accumulator + current.amount, 0)
                });
            }
        },
        err => {
            logger.error("An error occurred while getting balance: " + err);
            res.status(500).send({
                msg: err
            });
        }
    );
};