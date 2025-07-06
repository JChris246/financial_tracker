const logger = require("../logger").setup();
const { getDatabase } = require("../db/index");
const { ASSET_TYPE } = require("../utils/constants");
const { sleep, positiveNumberOrZero, toPrecision } = require("../utils/utils");

module.exports.getBalance = (_, res) => {
    const db = getDatabase();
    db.getAllTransactions(
        async transactions => {
            // totalIncome - cash, totalSpend - cash
            const response = {
                balance: 0, totalIncome: 0, totalSpend: 0, totalStock: 0, totalCrypto: 0, totalCash: 0,
                crypto: {}, cash: {}, stock: {} // individual balances
            };
            if (!transactions || transactions.length < 1) {
                res.status(200).send(response);
            } else {
                if (!global.cache) {
                    while (!global.cacheCreated) {
                        await sleep(100);
                    }
                    global.cache = db.getCache();
                }

                // TODO: this could refactor to add, then convert the currency at the end
                for (let i = 0; i < transactions.length; i++) {
                    if (transactions[i].assetType === ASSET_TYPE.CASH) {
                        const value = calculateCashAmount(transactions[i]);
                        response.balance += value;
                        if (transactions[i].type) {
                            response.totalIncome += value;
                        } else {
                            response.totalSpend += value;
                        }
                        response.totalCash += value;
                    } else if (transactions[i].assetType === ASSET_TYPE.STOCK) {
                        const value = calculateStockAmount(transactions[i]);
                        response.balance += value;
                        response.totalStock += value;
                    } else if (transactions[i].assetType === ASSET_TYPE.CRYPTO) {
                        const value = calculateCryptoAmount(transactions[i]);
                        response.balance += value;
                        response.totalCrypto += value;
                    }
                    response[transactions[i].assetType][transactions[i].currency] =
                        (response[transactions[i].assetType][transactions[i].currency] ?? 0) + transactions[i].amount;
                }

                // clean up values
                response.balance = toPrecision(response.balance);
                response.totalIncome = toPrecision(response.totalIncome);
                response.totalSpend = toPrecision(response.totalSpend);
                response.totalStock = toPrecision(response.totalStock);
                response.totalCrypto = toPrecision(response.totalCrypto);
                response.totalCash = toPrecision(response.totalCash);

                // calculate individual balances and allocations
                const convertCurrency = [calculateCashAmount, calculateStockAmount, calculateCryptoAmount];
                [ASSET_TYPE.CASH, ASSET_TYPE.STOCK, ASSET_TYPE.CRYPTO].forEach((assetType, i) => {
                    Object.keys(response[assetType]).forEach(currency => {
                        const assetTotal = assetType === ASSET_TYPE.STOCK
                            ? response.totalStock
                            : assetType === ASSET_TYPE.CRYPTO
                            ? response.totalCrypto
                            : response.totalCash;
                        const currencyValue = positiveNumberOrZero(convertCurrency[i]({ amount: response[assetType][currency], currency }));
                        response[assetType][currency] = {
                            amount: response[assetType][currency],
                            allocation: toPrecision(currencyValue / response.balance),
                            assetAllocation: toPrecision(currencyValue / assetTotal)
                        }
                    });
                });

                global.cache = null;
                res.status(200).send(response);
            }
        },
        err => {
            logger.error("getBalance - An error occurred while getting balance: " + err);
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