const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { ASSET_TYPE, ASSET_CURRENCIES, DEFAULT_CATEGORIES } = require("../utils/constants");
const { isDefined } = require("../utils/utils");

module.exports.getAssetTypes = (_, res) => res.status(200).send(Object.values(ASSET_TYPE));

module.exports.getCurrencies = (req, res) => {
    if (isDefined(req.params.assetType)) {
        const currencies = ASSET_CURRENCIES[req.params.assetType.toLowerCase()];
        if (isDefined(currencies)) {
            res.status(200).send(currencies);
        } else {
            logger.warn("User tried to get currencies for an invalid asset type: " + req.params.assetType);
            res.status(400).send({ msg: "Invalid asset type" });
        }
    } else {
        res.status(200).send(ASSET_CURRENCIES);
    }
};

module.exports.getTransactionCategories = async (_, res) => {
    const userCategories = await getDatabase().getAllTransactionCategories();
    const returnCategories = [...new Set([...DEFAULT_CATEGORIES, ...userCategories])].sort();

    res.status(200).send(returnCategories);
};