const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { ASSET_TYPE, ASSET_CURRENCIES, DEFAULT_CATEGORIES } = require("../utils/constants");
const { isDefined } = require("../utils/utils");

module.exports.getAssetTypes = () => Object.values(ASSET_TYPE);

module.exports.getCurrencies = (assetType) => {
    if (isDefined(assetType)) {
        const currencies = ASSET_CURRENCIES[assetType.toLowerCase()];
        if (isDefined(currencies)) {
            return { success: true, currencies };
        } else {
            logger.warn("User tried to get currencies for an invalid asset type: " + assetType);
            return { success: false };
        }
    } else {
        return { success: true, currencies: ASSET_CURRENCIES };
    }
};

module.exports.getTransactionCategories = async () => {
    const userCategories = await getDatabase().getAllTransactionCategories();
    const returnCategories = [...new Set([...DEFAULT_CATEGORIES, ...userCategories])].sort();

    return returnCategories
};