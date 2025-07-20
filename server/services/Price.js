const logger = require("../logger").setup();
const { isDefined, toPrecision } = require("../utils/utils");

const { getDatabase } = require("../db/index");
const { ASSET_TYPE, CRYPTO_CURRENCIES, DEFAULT_CURRENCIES, STOCK_CURRENCIES } = require("../utils/constants");

module.exports.getCurrencyPrice = async (req, res) => {
    const { assetType, currency } = req.params;

    if ([ASSET_TYPE.STOCK, ASSET_TYPE.CRYPTO].indexOf(assetType) === -1) {
        logger.warn("User tried to get price for an invalid asset type: " + assetType);
        return res.status(400).send({ msg: "Asset type not supported" });
    }

    const db = getDatabase();
    const cache = db.getCache();

    if (isDefined(currency)) {
        if (assetType === ASSET_TYPE.STOCK) {
            if (!STOCK_CURRENCIES.includes(currency.toUpperCase())) {
                logger.warn("User tried to get price for an invalid stock: " + currency);
                return res.status(400).send({ msg: "Stock not supported" });
            }
            // TODO: if we don't have a cached value, fetch it?
            return res.status(200).send({ [currency]: toPrecision(cache.stockPrices[currency.toUpperCase()]) });
        }
        if (assetType === ASSET_TYPE.CRYPTO) {
            if (!CRYPTO_CURRENCIES.includes(currency.toUpperCase())) {
                logger.warn("User tried to get price for an invalid crypto currency: " + currency);
                return res.status(400).send({ msg: "Crypto currency not supported" });
            }
            // TODO: if we don't have a cached value, fetch it?
            return res.status(200).send({ [currency.toUpperCase()]: toPrecision(cache.cryptoConversions[currency.toUpperCase()]) });
        }
    }

    const userCurrencies = await db.getAllTransactionCurrencies();
    const useCurrencies = {
        stock: [...new Set([...userCurrencies.stock, ...DEFAULT_CURRENCIES.stock]).values()],
        crypto: [...new Set([...userCurrencies.crypto, ...DEFAULT_CURRENCIES.crypto]).values()],
        cash: [...new Set([...userCurrencies.cash, ...DEFAULT_CURRENCIES.cash]).values()]
    };

    // returning the currencies that the user has transactions in (merged with default currencies)
    const map = {}; // TODO: limit the number of currencies returned?
    if (assetType === ASSET_TYPE.STOCK) {
        useCurrencies.stock.forEach(k => map[k] = toPrecision(cache.stockPrices[k.toUpperCase()]));
    }
    if (assetType === ASSET_TYPE.CRYPTO) {
        useCurrencies.crypto.forEach(k => map[k] = toPrecision(cache.cryptoConversions[k.toUpperCase()]));
    }
    return res.status(200).send(map);
};
