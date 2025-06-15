const logger = require("../logger").setup();

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

module.exports.getTransactionCategories = (_, res) => {
    // TODO: get the user save categories
    res.status(200).send(DEFAULT_CATEGORIES);
};