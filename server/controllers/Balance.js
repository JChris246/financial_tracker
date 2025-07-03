const logger = require("../logger").setup();
const { getDatabase } = require("../db/index");
const { ASSET_TYPE } = require("../utils/constants");

module.exports.getBalance = (_, res) => {
    getDatabase().getAllTransactions(
        transactions => {
            // TODO: there may be an optimized query for this (especially in sql)
            if (!transactions || transactions.length < 1) {
                res.status(200).send({ balance: 0, totalIncome: 0, totalSpend: 0, totalStock: 0, totalCrypto: 0 });
            } else {
                let netTotal = 0;
                let totalIncome = 0; // cash
                let totalSpend = 0; // cash
                let totalStock = 0;
                let totalCrypto = 0;

                for (let i = 0; i < transactions.length; i++) {
                    // TODO: do currency conversions
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

                res.status(200).send({ balance: netTotal, totalIncome, totalSpend, totalStock, totalCrypto });
            }
        },
        err => {
            logger.error("An error occurred while getting balance: " + err);
            res.status(500).send({
                msg: err
            });
        }
    );
};

const calculateCashAmount = (transaction) => {
    // TODO: configure a default currency
    if (transaction.currency === "USD") {
        return transaction.amount;
    }

    // TODO: convert to base currency
    return transaction.amount;
}

const calculateStockAmount = (transaction) => {
    // return the amount * value of the stock
    // TODO: convert to base currency
    return 0;
}

const calculateCryptoAmount = (transaction) => {
    // return the amount * value of the coin
    // TODO: convert to base currency
    return 0;
}