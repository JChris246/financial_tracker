const path = require("path");
const fs = require("fs");

const logger = require("../../logger").setup();

const fullDbPath = path.join(global.DB_PATH, "data");
const DB = ["db-transactions.json",]
    .map(file => path.join(fullDbPath, file));
const DB_TYPE = { TRANSACTIONS: 0 };

global.dbLock = false;

// TODO: should probably add error handling for this functions

const init = () => {
    if (!fs.existsSync(fullDbPath)) {
        logger.debug("Creating DB path: " + fullDbPath);
        fs.mkdirSync(fullDbPath, true);
    }

    for (const db of DB) {
        if (!fs.existsSync(db)) {
            fs.writeFileSync(db, "[]"); // create empty file...it may not always be a array needed
        }
    }
    logger.debug("JSON DB initialized");
    return true;
};

const getItems = (type, reason) => {
    if (!Object.values(DB_TYPE).includes(type)) {
        logger.error("Invalid DB type to get from: " + type + " " + reason);
        return [];
    }

    if (!fs.existsSync(DB[type])) {
        logger.warn("DB does not exist " + DB[type] + " returning empty list");
        return [];
    }

    logger.info("Reading, parsing and returning items from DB" + (reason ? ": " + reason : ""));
    return JSON.parse(fs.readFileSync(DB[type]));
};

const saveItems = async (type, items, additionalTag) => {
    if (!Object.values(DB_TYPE).includes(type)) {
        logger.error("Invalid DB type to save to: " + type);
        return;
    }

    // this is probably not necessary, js is single threaded. But paranoia
    while (global.dbLock) { // TODO: update this to consider the multiple db files
        // If the file is locked, wait and retry
        logger.info("waiting for db lock...");
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    global.dbLock = true;
    logger.info("saving items (" + (additionalTag ?? DB[type]) + ")");
    try {
        fs.writeFileSync(DB[type], JSON.stringify(items));
    } catch (e) {
        logger.error("Failed to save " + (additionalTag ?? DB[type]) + " items: " + e);
    }
    global.dbLock = false;
};

const getTransactions = (filter, successCallback) => {
    const db = getItems(DB_TYPE.TRANSACTIONS, "get transactions");

    const results = db.filter(t => {
        for (const [key, value] of Object.entries(filter)) {
            if (t[key] !== value) {
                return false;
            }
        }
        return true;
    });

    successCallback(results);
};

const createTransaction = (transaction, successCallback) => {
    const db = getItems(DB_TYPE.TRANSACTIONS, "create transaction");

    db.push(transaction);
    saveItems(DB_TYPE.TRANSACTIONS, db, "create transaction");

    successCallback(transaction);
};

const getAllTransactions = (successCallback) => {
    const db = getItems(DB_TYPE.TRANSACTIONS, "get all transactions");

    successCallback(db);
};

const getAllTransactionAmounts = (successCallback) => {
    const db = getItems(DB_TYPE.TRANSACTIONS, "get all transaction amounts");

    const results = db.map(t => t.amount);

    successCallback(results);
};

module.exports = { init, getTransactions, createTransaction, getAllTransactions, getAllTransactionAmounts };