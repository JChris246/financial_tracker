const logger = require("../logger").setup();
const { getDatabase } = require("../db/index");
const { ASSET_TYPE } = require("../utils/constants");
const { sleep, positiveNumberOrZero, toPrecision, parseDate } = require("../utils/utils");

const DAY = 1000 * 60 * 60 * 24; // TODO: candidate for the constants file

module.exports.getBalance = async () => {
    const db = await getDatabase();
    const transactions = await db.getAllTransactions();
    if (transactions) {
        // totalIncome - cash, totalSpend - cash
        const response = {
            balance: 0, totalIncome: 0, totalSpend: 0, totalStock: 0, totalCrypto: 0, totalCash: 0,
            crypto: {}, cash: {}, stock: {} // individual balances
        };
        if (transactions.length < 1) {
            return { success: true, response };
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
                    if (transactions[i].amount > 0) {
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
            return { success: true, response };
        }
    } else {
        logger.error("getBalance - An error occurred while getting balance: " + err);
        return { success: false };
    }
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

module.exports.getBalanceProgress = async (from, to) => {
    const toDate = parseDate(to) || new Date(); // if "to date" not passed, use "up to now"
    const fromDate = parseDate(from);

    if (!fromDate) {
        logger.warn("User passed an invalid start date: " + from);
        return { success: false, msg: "Start date invalid", code: 400 };
    }

    const toTime = toDate.getTime();
    const fromTime = fromDate.getTime();
    if (toTime < fromTime) {
        return { success: false, msg: "Start date cannot be after end date", code: 400 }
    }

    const db = await getDatabase();
    const transactions = await db.getAllTransactions();

    // TODO: starting with only cash balances ... update to calculator for stock and crypto

    if (!transactions) {
        logger.error("getBalanceProgress - An error occurred while getting balance progress: " + err);
        return { success: false, msg: "An error occurred fetching transactions to summarize balance progress", code: 500 };
    }

    // TODO: update to set correct balance based on the period
    // TODO: group by month to return total spend/income per month
    const response = {
        // balance: 0,
        totalIncome: 0, totalSpend: 0, avgMonthlySpend: 0, avgMonthlyIncome: 0
    };
    if (transactions.length < 1) {
        return { success: true, response, code: 200 };
    }

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].date >= fromTime && transactions[i].date <= toTime) {
            if (transactions[i].assetType === ASSET_TYPE.CASH) {
                const value = toPrecision(calculateCashAmount(transactions[i]), 4);
                if (transactions[i].amount > 0) {
                    response.totalIncome += value;
                } else {
                    response.totalSpend += value;
                }
            }
        }
    }

    const duration = Math.ceil((toTime - fromTime) / DAY);
    response.avgMonthlySpend = toPrecision((response.totalSpend / duration) * 30, 4);
    response.avgMonthlyIncome = toPrecision((response.totalIncome / duration) * 30, 4);

    return { success: true, response, code: 200 };
};