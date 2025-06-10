const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { isNumber } = require("../utils");

module.exports.getTransactions = (req, res) => {
    let options = {}; // get all transactions

    // if req specifies type of transactions to retrieve, add it to options
    if (req.params.type === "income" || req.params.type === "spend") {
        options = { "type": req.params.type === "income" };
        logger.warn("No type specified, using default 'income' type");
    }

    getDatabase().getTransactions(options,
        transactions => res.status(200).send(transactions),
        err => res.status(500).send({ msg: err })
    );
};

const parseDate = d => (new Date(d).getTime());

module.exports.addTransaction = (req, res) => {
    let amount = req.body.amount;
    const name = req.body.name;
    // get the timestamp from user, if it doesn't exist use the current timestamp
    const date = parseDate(req.body.date) || Date.now();

    if (!isNumber(Number(amount))) {
        logger.warn("User tried to add a transaction without an amount");
        res.status(400).send({ msg: "You need to have the transaction amount" });
    }
    amount = Number(amount);

    if (amount === 0) {
        logger.warn("User tried to add a transaction with an amount of 0");
        res.status(400).send({ msg: "You need to have a valid transaction amount" });
    }

    if (!name) {
        logger.warn("User tried to add a transaction without a name");
        res.status(400).send({ msg: "You need to have the transaction name" });
    }

    getDatabase().createTransaction(
        { name, amount, type: req.body.type || amount > 0, date },
        transaction => {
            res.status(201).send({
                amount: transaction.amount,
                name: transaction.name,
                date: transaction.date,
                msg: "Transaction added successfully",
            });
        },
        () => res.status(500).send({ msg: "Failed to add transaction" })
    );
};

module.exports.getGraphData = (_, res) => {
    getDatabase().getAllTransactions(
        transactions => {
            const graphData = {
                spend: [0, 0, 0, 0, 0, 0, 0],
                income: [0, 0, 0, 0, 0, 0, 0]
            };

            // Sunday - Saturday : 0 - 6
            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].amount < 0)
                    graphData.spend[new Date(transactions[i].date).getDay()] += (transactions[i].amount * -1);
                else graphData.income[new Date(transactions[i].date).getDay()] += transactions[i].amount;
            }

            res.status(200).send(graphData);
        },
        err => {
            logger.error("An error occurred while getting graph data: " + err);
            res.status(500).send({ msg: err });
        }
    );
};