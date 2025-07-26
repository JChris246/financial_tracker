const logger = require("../../logger").setup();
const { getCache: getCacheJson, saveCache: saveCacheJson } = require("../json");
const { distinctCaseIgnore } = require("../../utils/utils");

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const wipeDb = () => {
    if (global.env === "test") {
        // wipe any previous test server data
        return new Promise((resolve, reject) => {
            global.database.run(`DELETE FROM Transactions`, (err) => {
                if (err) {
                    logger.error("An error occurred while wiping the transactions table: " + err.message);
                    reject(err);
                }
                resolve();
            });
        });
    }
};

const seed = async () => {
    await new Promise((resolve, reject) => {
        // create table
        sql = `CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, amount REAL,
            category TEXT, date INTEGER, assetType TEXT, currency TEXT)`;
        global.database.run(sql, (err) => {
            if (err) {
                logger.error("An error occurred while seeding the transactions table: " + err.message);
                reject(err);
            }
            resolve();
        });
    });

    // create indexes
    await new Promise((resolve, reject) => {
        global.database.run(`CREATE INDEX IF NOT EXISTS assetTypeIndex ON transactions(assetType)`, (err) => {
            if (err) {
                logger.error("An error occurred creating assetTypeIndex " + err.message);
                reject(err);
            }
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        global.database.run(`CREATE INDEX IF NOT EXISTS categoryIndex ON transactions(category)`, (err) => {
            if (err) {
                logger.error("An error occurred creating categoryIndex " + err.message);
                reject(err);
            }

            resolve();
        });
    });
};

const init = async () => {
    if (global.database) {
        await wipeDb();
        return true;
    }

    const fullDbPath = path.join(global.DB_PATH, "data/finance_tracker.db");
    if (!fs.existsSync(path.join(global.DB_PATH, "data"))) {
        logger.debug("Creating DB path: " + global.DB_PATH);
        fs.mkdirSync(global.DB_PATH, { recursive: true });
    }

    if (!fs.existsSync(fullDbPath)) {
        logger.debug("Creating DB file: " + fullDbPath);
        fs.writeFileSync(fullDbPath, "", "utf8");
    }

    await new Promise((resolve, reject) => {
        global.database = new sqlite3.Database(fullDbPath, sqlite3.OPEN_READWRITE, async (err) => {
            if (err) {
                logger.error("Error opening database: " + err.message);
                reject(err.message);
            }
            resolve();
        });
    });

    try {
        await seed();
        await wipeDb();
        logger.debug("sql DB initialized");
        return true;
    } catch (err) {
        logger.error("Error initializing sql DB: " + err.message);
        return false;
    }
};

// temp unused
const getTransactions = filter => {
    return [];
};

const createTransaction = transaction => {
    return new Promise((resolve, reject) => {
        global.database.run(
            `INSERT INTO transactions (name, amount, category, date, assetType, currency) VALUES (?,?,?,?,?,?)`,
            [transaction.name, transaction.amount, transaction.category, transaction.date, transaction.assetType, transaction.currency],
            (err) => {
                if (err) {
                    logger.error("An error occurred while creating a transaction: " + err.message);
                    reject(null);
                } else {
                    resolve(transaction);
                }
            }
        );
    });
};

const createTransactions = async transactions => {
    const savedTransactions = [];

    // laziness, but also isn't there a 1000 item limit for a single query?
    for (let i = 0; i < transactions.length; i++) {
        const result = await createTransaction(transactions[i]);
        if (result) {
            savedTransactions.push(transactions[i]);
        } else {
            logger.error("Failed to add all transactions");
            return { success: false };
        }
    }

    return { success: true, savedTransactions };
};

const getAllTransactions = () => {
    return new Promise((resolve, reject) => {
        global.database.all(
            `SELECT * FROM transactions`,
            function (err, rows) {
                if (err) {
                    logger.error("An error occurred while getting transactions: " + err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
};

const getAllTransactionCurrencies = async () => {
    const query = (assetType) => {
        return new Promise((resolve, reject) => {
            global.database.all(
                `SELECT DISTINCT currency FROM transactions WHERE assetType = "${assetType}"`,
                function (err, rows) {
                    if (err) {
                        logger.error("An error occurred while getting distinct currencies for asset type " + assetType + ": " + err.message);
                        reject(null);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    const results = await Promise.all([query("cash"), query("crypto"), query("stock")]);

    return {
        cash: distinctCaseIgnore(results[0]?.map(row => row.currency) ?? []),
        crypto: distinctCaseIgnore(results[1]?.map(row => row.currency) ?? []),
        stock: distinctCaseIgnore(results[2]?.map(row => row.currency) ?? [])
    };
};

const getAllTransactionCategories = async () => {
    const rows = await new Promise((resolve, reject) => {
        global.database.all(
            `SELECT DISTINCT category FROM transactions`,
            function (err, rows) {
                if (err) {
                    logger.error("An error occurred while getting distinct categories: " + err.message);
                    reject(err);
                } else {
                    resolve(rows?.map(row => row.category));
                }
            }
        );
    });

    return distinctCaseIgnore(rows);
};

// because I'm lazy, and don't think the cache record should be a whole table (also should this be redis?)
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

module.exports = {
    init, wipeDb, getTransactions, createTransaction, createTransactions, getAllTransactions,
    getCache, saveCache, getAllTransactionCurrencies, getAllTransactionCategories
};