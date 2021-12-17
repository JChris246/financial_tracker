const Transaction = require("../models/Transactions");

module.exports.getTransactions = (req, res) => {
    let options = {}; // get all transactions

    // if req specifies type of transactions to retrieve, add it to options
    if (req.params.type === "income" || req.params.type === "spend")
        options = { "type": req.params.type === "income" };

    Transaction.find(options, { name: 1, amount: 1 }, (err, transactions) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                msg: err
            });
        }
        res.status(200).send(transactions);
    });
}

module.exports.addTransaction = (req, res) => {
    const amount = req.body.amount;
    const name = req.body.name;

    if (!amount)
        res.send(400).send({ msg: "You need to have the transaction amount" });
    if (!name)
        res.send(400).send({ msg: "You need to have the transaction name" });

    const type = req.body.type || amount > 0;
    
    const newTransaction = new Transaction({ name, amount, type });
    newTransaction.save().then(savedTransaction => {
        // if savedTransaction returned is the same as newTransaction then saved successfully
        if (savedTransaction === newTransaction)
            res.status(201).send({
                amount: savedTransaction.amount,
                name: savedTransaction.name,
                msg: "Transaction added successfully",
            });
        else res.status(500).send({
            msg: "Failed to add transaction"
        });
    });
}