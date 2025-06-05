const Transaction = require("../models/Transactions");

module.exports.getTransactions = (req, res) => {
    let options = {}; // get all transactions

    // if req specifies type of transactions to retrieve, add it to options
    if (req.params.type === "income" || req.params.type === "spend")
        options = { "type": req.params.type === "income" };

    Transaction.find(options, { name: 1, amount: 1, date: 1 }, (err, transactions) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                msg: err
            });
        }
        res.status(200).send(transactions);
    });
};

const parseDate = d => (new Date(d).getTime());

module.exports.addTransaction = (req, res) => {
    const amount = req.body.amount;
    const name = req.body.name;
    // get the timestamp from user, if ut doesnt exist use the current timestamp
    const date = parseDate(req.body.date) || Date.now();

    if (!amount)
        res.send(400).send({ msg: "You need to have the transaction amount" });
    if (!name)
        res.send(400).send({ msg: "You need to have the transaction name" });

    const type = req.body.type || amount > 0;

    const newTransaction = new Transaction({ name, amount, type, date });
    newTransaction.save().then(savedTransaction => {
        // if savedTransaction returned is the same as newTransaction then saved successfully
        if (savedTransaction === newTransaction)
            res.status(201).send({
                amount: savedTransaction.amount,
                name: savedTransaction.name,
                date: savedTransaction.date,
                msg: "Transaction added successfully",
            });
        else res.status(500).send({
            msg: "Failed to add transaction"
        });
    });
};

module.exports.getGraphData = (_, res) => {
    Transaction.find({}, (err, transactions) => {
        if (err) {
            console.log(err);
            res.status(500).send({ msg: err });
        }

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
    });
};