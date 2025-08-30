const mongoose = require("mongoose");

const Transaction = require("./models/Transactions");
const { getCache: getCacheJson, saveCache: saveCacheJson } = require("../json");
const { isValidString } = require("../../utils/utils");

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
        Transaction.createIndexes();
        return true;
    } catch (e) {
        logger.error("Failed to connect to mongo: " + e);
        return false;
    }
};

// temp unused
// this pattern may not work for all db types...but using it for now
// I also don't particularly like the callback pattern
const getTransactions = async (filter) => {
    try {
        const transactions = await Transaction.find(filter, { name: 1, amount: 1, date: 1 });
        transactions.forEach(transaction => transaction.id = transaction._id);
        return transactions;
    } catch (err) {
        if (err) {
            logger.error("An error occurred while getting transactions: " + err);
            return null;
        }
    }
};

const createTransaction = async (transaction) => {
    const newTransaction = new Transaction({ ...transaction });
    const savedTransaction = await newTransaction.save();

    // if savedTransaction returned is the same as newTransaction then saved successfully
    if (savedTransaction === newTransaction) {
        logger.info("Transaction added successfully");
        return { ...savedTransaction._doc, id: savedTransaction._id };
    } else {
        logger.error("Failed to add transaction");
        return null;
    }
};

const createTransactions = async (transactions) => {
    let savedTransactions = await Transaction.insertMany([ ...transactions ]);

    if (savedTransactions.length !== transactions.length) {
        logger.error("Failed to add all transactions");
        return { success: false };
    }

    return {
        success: true,
        savedTransactions: savedTransactions.map(t => {
            t.id = t._id;
            return t;
        })
    };
};

const getAllTransactions = async () => {
    try {
        const transactions = await Transaction.find({});
        transactions.forEach(transaction => transaction.id = transaction._id);
        return transactions;
    } catch (err) {
        if (err) {
            logger.error("An error occurred while getting transactions: " + err);
            return null;
        }
    }
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

const getAllTransactionCategories = async () => {
    const results = await Transaction.distinct("category");

    return results.filter(c => isValidString(c)).map(c => c.toLowerCase());
};

const deleteTransaction = async id => {
    const result = await Transaction.deleteOne({ "_id": id });
    if (result.deletedCount === 0) {
        logger.warn("Transaction does not exist to delete " + id);
        return false;
    }

    logger.info("Transaction " + id + " removed");
    return true;
};

const updateTransaction = async (id, transaction) => {
    const updated = await Transaction.findByIdAndUpdate(id, transaction, { new: true, upsert: false });

    if (!updated) {
        logger.warn("The transaction didn't exist to update");
        return false;
    }

    return { ...updated._doc, id: updated._id, _id: undefined, __v: undefined };
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

module.exports = { init, wipeDb, getTransactions, createTransaction, createTransactions, getAllTransactions,
    getCache, saveCache, getAllTransactionCurrencies, getAllTransactionCategories, deleteTransaction, updateTransaction };

