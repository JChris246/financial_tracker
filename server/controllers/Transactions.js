const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { isNumber, makeBool, isDefined } = require("../utils/utils");
const { ASSET_TYPE, ASSET_CURRENCIES } = require("../utils/constants");

module.exports.getTransactions = (req, res) => {
    let options = {}; // get all transactions

    // if req specifies type of transactions to retrieve, add it to options
    if (req.params.type === "income" || req.params.type === "spend") {
        options = { "type": req.params.type === "income" };
    }

    getDatabase().getTransactions(options,
        transactions => res.status(200).send(transactions),
        err => res.status(500).send({ msg: err })
    );
};

const parseDate = d => (new Date(d).getTime());

const validateAddTransactionRequest = (req, res) => {
    const { name, date: userDate, amount: userAmount, type: userType, category, assetType, currency } = req.body;

    // get the timestamp from user, if it doesn't exist use the current timestamp
    const date = parseDate(userDate) || Date.now();

    if (!isNumber(Number(userAmount))) {
        logger.warn("User tried to add a transaction without an amount");
        res.status(400).send({ msg: "You need to have the transaction amount" });
        return null;
    }
    const amount = Number(userAmount);

    if (amount === 0) {
        logger.warn("User tried to add a transaction with an amount of 0");
        res.status(400).send({ msg: "You need to have a valid transaction amount" });
        return null;
    }

    if (!name) {
        logger.warn("User tried to add a transaction without a name");
        res.status(400).send({ msg: "You need to have the transaction name" });
        return null;
    }

    const type = isDefined(userType) ? makeBool(userType) : amount > 0;

    if (!isDefined(category)) {
        logger.warn("Transaction adding without a category");
    }

    if (!isDefined(assetType)) {
        logger.warn("User tried to add a transaction without an asset type");
        res.status(400).send({ msg: "You need to have the transaction asset type" });
        return null;
    }

    if (Object.values(ASSET_TYPE).indexOf(assetType.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid asset type");
        res.status(400).send({ msg: "You need to have a valid transaction asset type" });
        return null;
    }

    if (!isDefined(currency)) {
        logger.warn("User tried to add a transaction without a currency");
        res.status(400).send({ msg: "You need to have the transaction currency" });
        return null;
    }

    // TODO: make all asset currencies a common case
    if (ASSET_CURRENCIES[assetType.toLowerCase()].map(x => x.toLowerCase()).indexOf(currency.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid currency: " + currency + " for asset type: " + assetType);
        res.status(400).send({ msg: "Asset currency not supported" });
        return null;
    }

    return { name, date, amount, type, category, assetType: assetType.toLowerCase(), currency: currency.toLowerCase() };
}

module.exports.addTransaction = (req , res) => {
    const result = validateAddTransactionRequest(req, res);
    if (!result) {
        return;
    }

    const { name, date, amount, type, category, assetType, currency } = result;
    getDatabase().createTransaction(
        { name, date, amount, type, category, assetType, currency },
        transaction => {
            res.status(201).send({
                // maybe I should separate the payload from the message ?
                amount: transaction.amount,
                name: transaction.name,
                date: transaction.date,
                type: transaction.type,
                category: transaction.category,
                assetType: transaction.assetType,
                currency: transaction.currency,
                msg: "Transaction added successfully",
            });
        },
        () => res.status(500).send({ msg: "Failed to add transaction" })
    );
};

module.exports.getGraphData = (_, res) => {
    getDatabase().getAllTransactions(
        transactions => {
            const graphData = {
                spend: [0, 0, 0, 0, 0, 0, 0],
                income: [0, 0, 0, 0, 0, 0, 0]
            };

            // Sunday - Saturday : 0 - 6
            for (let i = 0; i < transactions.length; i++) {
                if (transactions[i].amount < 0)
                    graphData.spend[new Date(transactions[i].date).getDay()] += (transactions[i].amount * -1);
                else graphData.income[new Date(transactions[i].date).getDay()] += transactions[i].amount;
            }

            res.status(200).send(graphData);
        },
        err => {
            logger.error("An error occurred while getting graph data: " + err);
            res.status(500).send({ msg: err });
        }
    );
};