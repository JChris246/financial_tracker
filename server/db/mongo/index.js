const mongoose = require("mongoose");

const Transaction = require("./models/Transactions");
const { getCache: getCacheJson, saveCache: saveCacheJson } = require("../json");

const logger = require("../../logger").setup();

let databaseConnected = false;

const wipeDb = () => {
    if (global.env === "test") {
        // wipe any previous test server data
        return new Promise((resolve, reject) => {
            Transaction.deleteMany({}, (err) => {
                if (err) {
                    logger.error("An error occurred while wiping the database: " + err);
                    reject(err);
                }
                resolve();
            })
        });
    }
};

const init = async () => {
    if (databaseConnected) {
        await wipeDb();
        return true;
    }

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
        databaseConnected = true;
        await wipeDb();
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

const getAllTransactionCurrencies = async () => {
    const results = await Promise.all([
        Transaction.distinct("currency", { assetType: "cash" }),
        Transaction.distinct("currency", { assetType: "crypto" }),
        Transaction.distinct("currency", { assetType: "stock" })
    ]);

    return {
        cash: results[0] ?? [],
        crypto: results[1] ?? [],
        stock: results[2] ?? []
    }
};

// because I'm lazy, and don't think the cache record should be a whole collection (also should this be redis?)
const getCache = () => {
    const cache = getCacheJson();
    if (Array.isArray(cache) && cache.length === 0) {
        return {};
    }
    return cache;
};

const saveCache = (cache) => {
    saveCacheJson(cache);
};

module.exports = { init, wipeDb, getTransactions, createTransaction, getAllTransactions, getAllTransactionAmounts,
    getCache, saveCache, getAllTransactionCurrencies };

