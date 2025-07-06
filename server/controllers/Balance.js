const logger = require("../logger").setup();
const { getDatabase } = require("../db/index");
const { ASSET_TYPE } = require("../utils/constants");
const { sleep } = require("../utils/utils");

module.exports.getBalance = (_, res) => {
    const db = getDatabase();
    db.getAllTransactions(
        async transactions => {
            if (!transactions || transactions.length < 1) {
                res.status(200).send({ balance: 0, totalIncome: 0, totalSpend: 0, totalStock: 0, totalCrypto: 0 });
            } else {
                let netTotal = 0;
                let totalIncome = 0; // cash
                let totalSpend = 0; // cash
                let totalStock = 0;
                let totalCrypto = 0;

                if (!global.cache) {
                    while (!global.cacheCreated) {
                        await sleep(100);
                    }
                    global.cache = db.getCache();
                }

                for (let i = 0; i < transactions.length; i++) {
                    if (transactions[i].assetType === ASSET_TYPE.CASH) {
                        const value = calculateCashAmount(transactions[i]);
                        netTotal += value;
                        if (transactions[i].type) {
                            totalIncome += value;
                        } else {
                            totalSpend += value;
                        }
                    } else if (transactions[i].assetType === ASSET_TYPE.STOCK) {
                        const value = calculateStockAmount(transactions[i]);
                        netTotal += value;
                        totalStock += value;
                    } else if (transactions[i].assetType === ASSET_TYPE.CRYPTO) {
                        const value = calculateCryptoAmount(transactions[i]);
                        netTotal += value;
                        totalCrypto += value;
                    }
                }

                global.cache = null;
                res.status(200).send({ balance: netTotal, totalIncome, totalSpend, totalStock, totalCrypto });
            }
        },
        err => {
            logger.error("getBalance - An error occurred while getting balance: " + err);
            res.status(500).send({ msg: err });
        }
    );
};

// does this really need to be a separate endpoint?
module.exports.getAllBalances = (_, res) => {
    const db = getDatabase();
    db.getAllTransactions(
        async transactions => {
            const balances = { crypto: {}, cash: {}, stock: {} };
            if (!transactions || transactions.length < 1) {
                res.status(200).send(balances);
            } else {
                for (let i = 0; i < transactions.length; i++) {
                    balances[transactions[i].assetType][transactions[i].currency] =
                        (balances[transactions[i].assetType][transactions[i].currency] ?? 0) + transactions[i].amount;
                }
                res.status(200).send(balances);
            }
        },
        err => {
            logger.error("getAllBalances - An error occurred while getting balances: " + err);
            res.status(500).send({ msg: err });
        }
    );
};

const calculateCashAmount = (transaction) => {
    // TODO: configure a default currency, for now assuming usd
    if (transaction.currency.toUpperCase() === "USD") { // this may not be necessary, the base currency should also be in cache
        return transaction.amount;
    }

    // the rate should be against the base currency
    const rate = global.cache.fiatConversions[transaction.currency.toLowerCase()] ?? 1;

    // convert to base currency
    return transaction.amount * rate;
}

const calculateStockAmount = (transaction) => {
    // this rate is in most likely in USD
    const rate = global.cache.stockPrices[transaction.currency.toUpperCase()] ?? 1;

    return transaction.amount * rate;
}

const calculateCryptoAmount = (transaction) => {
    // the rate should be against the base fiat currency
    const rate = global.cache.cryptoConversions[transaction.currency.toUpperCase()] ?? 1;

    // convert to base fiat currency
    return transaction.amount * rate;
}