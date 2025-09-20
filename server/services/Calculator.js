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

// TODO: test value of the history property in the response?

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
        history, initial
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
        const result = await getCurrencyPrice({ assetType: ASSET_TYPE.STOCK, currency: symbol });
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

    return {
        price,
        ...calculateCompound({ initial, contribute, interest: divAmount / price, months, frequency })
    };
};

// price - total price (before deposit)
// down - loan deposit
// months - loan term
// interest - interest rate (yearly)
const calculateMonthly = ({ price, down, months, interest }) => {
    // TODO: this does not factor in PMI
    const principal = price - down;
    const rate = interest / 12;
    const top = rate * ((1 + rate) ** months);
    const bottom = ((1 + rate) ** months) - 1;
    const monthlyPayment = principal * (top / bottom);

    return monthlyPayment;
};

// loanAmount - total loan amount after deposit
// months - loan term
// monthly - monthly payment
// interest - interest rate (yearly)
const calculateAmortization = ({ loanAmount, months, monthly, interest }) => {
    let loanBalance = loanAmount + 0;
    let interestPaid = 0;
    let principalPaid = 0;
    const history = [];

    for (let i = 0; i < months; i++) {
        const currentInterest = loanBalance * interest / 12;
        const currentPrincipalPaid = monthly - currentInterest;
        interestPaid += currentInterest;
        principalPaid += currentPrincipalPaid;
        loanBalance -= currentPrincipalPaid;

        history.push({
            currentInterest: toPrecision(currentInterest, 2),
            currentPrincipalPaid: toPrecision(currentPrincipalPaid, 2),
            interestPaid: toPrecision(interestPaid, 2),
            principalPaid: toPrecision(principalPaid, 2),
            loanBalance: toPrecision(loanBalance, 2),
        });
    }

    return {
        success: true, code: 200,
        interestPaid: toPrecision(interestPaid, 2), loanAmount, monthly: toPrecision(monthly, 2),
        totalPaid: toPrecision(loanAmount + interestPaid, 2), history // TODO: test totalPaid
    };
};

module.exports.calculateAmortization = ({ price, down, months, interest }) => {
    if (!isNumber(price)) {
        logger.warn("User provided a bad price value: " + price);
        return { success: false, code: 400, msg: "Invalid price value" };
    }

    if (!(Number(price) > 0)) {
        logger.warn("User provided a non positive price value " + price);
        return { success: false, code: 400, msg: "Price value should be more than 0" };
    }

    if (!isNumber(down)) {
        logger.warn("User provided a deposit value: " + price);
        return { success: false, code: 400, msg: "Invalid deposit value" };
    }

    if (Number(down) > Number(price)) {
        logger.warn("User provided a deposit value higher than the price:" + down + " " + price);
        return { success: false, code: 400, msg: "Deposit should not exceed price" };
    }

    if (!isNumber(months)) {
        logger.warn("User provided a bad pay monthly period value: " + months);
        return { success: false, code: 400, msg: "Invalid period" };
    }

    if (!isNumber(interest) || !(interest > 0)) {
        logger.warn("User provided a bad interest rate: " + interest);
        return { success: false, code: 400, msg: "Invalid interest rate" };
    }

    const monthly = calculateMonthly({ price, down, months, interest });
    return calculateAmortization({ loanAmount: price - down, months, monthly, interest })
};