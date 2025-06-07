const mongoose = require("mongoose");

const Transaction = require("./models/Transactions");

const logger = require("../../logger").setup();

const init = async () => {
    const DB_URL = "mongodb://" + process.env.DB_HOST + "/" + process.env.DB_NAME;
    mongoose.set("strictQuery", false); // this should suppress the warning that strictQuery will be set to false by default in Mongoose 7
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: "admin",
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
        });
        return true;
    } catch (e) {
        logger.error("Failed to connect to mongo: " + e);
        return false;
    }
};

// this pattern may not work for all db types...but using it for now
// I also don't particularly like the callback pattern
const getTransactions = (filter, successCallback, errorCallback) => {
    Transaction.find(filter, { name: 1, amount: 1, date: 1 }, (err, transactions) => {
        if (err) {
            logger.error("An error occurred while getting transactions: " + err);
            errorCallback(err);
            return;
        }
        successCallback(transactions);
    });
};

const createTransaction = (transaction, successCallback, errorCallback) => {
    const newTransaction = new Transaction({ ...transaction });
    newTransaction.save().then(savedTransaction => {
        // if savedTransaction returned is the same as newTransaction then saved successfully
        if (savedTransaction === newTransaction) {
            logger.info("Transaction added successfully");
            successCallback(savedTransaction);
        } else {
            logger.error("Failed to add transaction");
            errorCallback();
        }
    });
};

const getAllTransactions = (successCallback, errorCallback) => {
    Transaction.find({}, (err, transactions) => {
        if (err) {
            logger.error("An error occurred while getting all transactions: " + err);
            errorCallback(err);
            return;
        }
        successCallback(transactions);
    });
};

const getAllTransactionAmounts = (successCallback, errorCallback) => {
    Transaction.find({}, { "amount": 1 }, (err, transactions) => {
        if (err) {
            logger.error("An error occurred while getting all transaction amounts: " + err);
            errorCallback(err);
            return;
        }
        successCallback(transactions.map(t => t.amount));
    });
};

module.exports = { init, getTransactions, createTransaction, getAllTransactions, getAllTransactionAmounts };

