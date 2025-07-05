const path = require("path");
const fs = require("fs");

const logger = require("../../logger").setup();

const fullDbPath = path.join(global.DB_PATH, "data");
const DB = ["db-transactions.json", "db-cache.json"]
    .map(file => path.join(fullDbPath, file));
const DB_TYPE = { TRANSACTIONS: 0, CACHE: 1 };

global.dbLock = false;

// TODO: should probably add error handling for this functions


const wipeDb = () => {
    if (global.env === "test") {
        // wipe any previous test server data
        if (fs.existsSync(fullDbPath)) {
            // fs.rmSync(fullDbPath, { recursive: true });
            for (const db of DB) {
                if (db.endsWith(DB[DB_TYPE.CACHE])) {
                    continue; // skip removing cache db
                }
                logger.debug("removing " + db);
                if (fs.existsSync(db)) {
                    fs.unlinkSync(db);
                }
            }
        }
    }
};

// TODO: create this function for the other db types?
const seedDb = () => {
    if (!fs.existsSync(fullDbPath)) {
        logger.debug("Creating DB path: " + fullDbPath);
        fs.mkdirSync(fullDbPath, { recursive: true });
    }

    for (const db of DB) {
        if (!fs.existsSync(db)) {
            let ObjectType;
            switch(db) {
                case DB[DB_TYPE.TRANSACTIONS]:
                    ObjectType = "[]";
                    break;
                case DB[DB_TYPE.CACHE]:
                    ObjectType = "{}";
                    break;
                default:
                    logger.warn("Invalid DB type to seed: " + db);
                    ObjectType = "[]";
                    return;
            }
            fs.writeFileSync(db, ObjectType);
        }
    }
};

const init = () => {
    wipeDb();
    seedDb();

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


// should this maybe be a redis cache?

// don't update cache on retrieval if it's old, a background process will update the cache
// to avoid requests being lengthy because of the cache refresh process
const getCache = () => getItems(DB_TYPE.CACHE, "get cache");

const saveCache = (cache) => {
    cache.lastUpdated = Date.now();
    saveItems(DB_TYPE.CACHE, cache)
};

module.exports = { init, wipeDb, getTransactions, createTransaction, getAllTransactions, getAllTransactionAmounts, getCache, saveCache };