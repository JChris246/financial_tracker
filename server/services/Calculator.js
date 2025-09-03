const logger = require("../logger").setup();

const { isNumber, toPrecision, isValidString, isDefined } = require("../utils/utils");
const { PAYMENT_FREQUENCY, ASSET_TYPE } = require("../utils/constants");
const { getCurrencyPrice } = require("./Price");

const frequencyJump = {
    [PAYMENT_FREQUENCY.MONTHLY]: 1,
    [PAYMENT_FREQUENCY.BIMONTHLY]: 2,
    [PAYMENT_FREQUENCY.QUARTERLY]: 3,
    [PAYMENT_FREQUENCY.SEMIANNUALLY]: 6,
    [PAYMENT_FREQUENCY.ANNUALLY]: 12,
};

const calculateCompound = ({ initial, interest, contribute, months, frequency }) => {
    if (!isNumber(initial)) {
        logger.warn("User provided a bad investment value: " + initial);
        return { success: false, code: 400, msg: "Invalid investment value" };
    }

    if (!isNumber(contribute)) {
        logger.warn("User provided a bad contribution value: " + contribute);
        return { success: false, code: 400, msg: "Invalid contribution value" };
    }

    if (initial === 0 && contribute === 0) {
        logger.info("User provided no investment or contribution value, returning 0 values");
        return { success: true, code: 200, profit: 0, balance: 0, totalContrib: 0, history: [] };
    }

    if (!Object.values(PAYMENT_FREQUENCY).includes(frequency)) {
        logger.warn("User provided a bad payout frequency value: " + frequency);
        return { success: false, code: 400, msg: "Payout frequency not recognized" };
    }

    if (!isNumber(months)) {
        logger.warn("User provided a bad pay period value: " + months);
        return { success: false, code: 400, msg: "Invalid period" };
    }

    if (!isNumber(interest)) {
        logger.warn("User provided a bad interest rate: " + interest);
        return { success: false, code: 400, msg: "Invalid interest rate" };
    }

    const history = [];

    let balance = initial;
    let totalContrib = 0;
    for (let i = 0; i < months; i+=frequencyJump[frequency]) {
        if (i != 0) {
            balance += contribute;
            totalContrib += contribute;
        }
        const stepEarned = balance * interest;
        balance += stepEarned;
        history.push({
            startBalance: toPrecision(balance - (i == 0 ? 0 : contribute) - stepEarned, 2),
            balance: toPrecision(balance, 2),
            totalContrib: toPrecision(totalContrib, 2),
            profit: toPrecision(balance - totalContrib - initial, 2),
            stepEarned: toPrecision(stepEarned, 2)
        });
    }

    return {
        success: true, code: 200,
        balance: toPrecision(balance, 2),
        profit: toPrecision(balance - totalContrib - initial, 2),
        totalContrib: toPrecision(totalContrib, 2),
        history
    }
};

module.exports.calculateCompound = calculateCompound;

module.exports.calculateStockCompound = async ({ shares, initial, symbol, price, divAmount, contribute, months, frequency }) => {
    if (!isNumber(divAmount)) {
        logger.warn("User did not a valid provide dividend amount: " + divAmount);
        return { success: false, code: 400, msg: "You must provide the dividend amount per share" };
    }

    if (!isNumber(initial) && !isNumber(shares)) {
        logger.warn("User did not a valid provide initial investment value: " + initial);
        return { success: false, code: 400, msg: "Must provide the initial amount either as share count or total worth" };
    }

    if (!isNumber(price) && !isValidString(symbol)) {
        logger.warn(`User did not provide stock price or symbol: '${price}' - '${symbol}'`);
        return { success: false, code: 400, msg: "You must provide either stock symbol or price" };
    }

    if (!isNumber(price)) {
        logger.info("Getting stock price for " + symbol);
        const result = await getCurrencyPrice({ assetType: ASSET_TYPE.STOCK, currency: symbol }); // TODO: update function to search price if not in cache
        if (!result.success) {
            logger.error("An error occurred getting stock price to do compound calculation: " + result.msg);
            return { success: false, code: 500, msg: result.msg };
        }

        price = result.response[symbol];
        if (!isDefined(price) || price === 0) {
            logger.error("Retrieved an invalid stock price value: " + price);
            return { success: false, code: 500, msg: "Retrieved an invalid stock price" };
        }
    }

    if (price === 0) {
        logger.warn("User provided a 0 value stock price");
        return { success: false, code: 400, msg: "Stock price cannot be 0" };
    }

    if (isNumber(shares) && shares > 0) {
        logger.info("Using shares value");
        initial = shares * price;
    } else {
        logger.info("Using stock value")
    }

    return calculateCompound({ initial, contribute, interest: divAmount / price, months, frequency });
};