const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { isNumber, makeBool, isDefined, isValidArray, formatDate } = require("../utils/utils");
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

// TODO: unit test this?
const validateAddTransactionRequest = (reqBody) => {
    const { name, date: userDate, amount: userAmount, type: userType, category: userCategory, assetType, currency } = reqBody;

    // get the timestamp from user, if it doesn't exist use the current timestamp
    const date = parseDate(userDate) || Date.now(); // if the date was not parsed correctly, current timestamp will be used

    if (!isNumber(userAmount)) {
        logger.warn("User tried to add a transaction without an amount");
        return { valid: false, msg: "You need to have the transaction amount" };
    }
    const amount = Number(userAmount);

    if (amount === 0) {
        logger.warn("User tried to add a transaction with an amount of 0");
        return { valid: false, msg: "You need to have a valid transaction amount" };
    }

    if (!name) {
        logger.warn("User tried to add a transaction without a name");
        return { valid: false, msg: "You need to have the transaction name" };
    }

    // should we validate that the userType (if provided) matches with the transaction amount?
    // should we even be accepting type, just infer
    const type = isDefined(userType) ? makeBool(userType) : amount > 0;

    let category = userCategory;
    if (!isDefined(userCategory)) {
        logger.warn("Transaction adding without a category, defaulting to other");
        category = "other";
    }

    if (!isDefined(assetType)) {
        logger.warn("User tried to add a transaction without an asset type");
        return { valid: false, msg: "You need to have the transaction asset type" };
    }

    if (Object.values(ASSET_TYPE).indexOf(assetType.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid asset type");
        return { valid: false, msg: "You need to have a valid transaction asset type" };
    }

    if (!isDefined(currency)) {
        logger.warn("User tried to add a transaction without a currency");
        return { valid: false, msg: "You need to have the transaction currency" };
    }

    // TODO: make all asset currencies a common case
    if (ASSET_CURRENCIES[assetType.toLowerCase()].map(x => x.toLowerCase()).indexOf(currency.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid currency: " + currency + " for asset type: " + assetType);
        return { valid: false, msg: "Asset currency not supported" };
    }

    return { valid: true, name, date, amount, type, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() };
}

module.exports.addTransaction = (req , res) => {
    const result = validateAddTransactionRequest(req.body);
    if (!result.valid) {
        return res.status(400).send({ msg: result.msg });
    }

    const { name, date, amount, type, category, assetType, currency } = result;
    getDatabase().createTransaction(
        { name, date, amount, type, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() },
        transaction => {
            res.status(201).send({
                // maybe I should separate the payload from the message ?
                amount: transaction.amount,
                name: transaction.name,
                date: transaction.date,
                type: transaction.type,
                category: transaction.category,
                assetType: transaction.assetType.toLowerCase(),
                currency: transaction.currency.toUpperCase(),
                msg: "Transaction added successfully",
            });
        },
        () => res.status(500).send({ msg: "Failed to add transaction" })
    );
};

module.exports.addTransactions = (req , res) => {
    const userTransactions = req.body;
    if (!isValidArray(userTransactions)) {
        logger.warn("User tried to add transactions without a valid array");
        return res.status(400).send({ msg: "You need to have at least one transaction" });
    }

    // if any transaction is invalid, reject all (no partial adding)
    let invalid = 0;
    const transaction = [];
    for (let i = 0; i < userTransactions.length; i++) {
        const result = validateAddTransactionRequest(userTransactions[i]);
        if (!result.valid) {
            invalid += 1;
        }
        transaction.push(result);
    }

    // might be more helpful to return the invalid transactions and why they are invalid
    if (invalid > 0) {
        logger.warn("User tried to add " + invalid + " invalid transactions");
        return res.status(400).send({ msg: "You have " + invalid + " invalid transactions" });
    }

    const addedTransactions = [];
    for (let i = 0; i < transaction.length; i++) {
        const { name, date, amount, type, category, assetType, currency } = transaction[i];
        // I'm almost pretty sure there's a better way than inserting 1 by 1
        getDatabase().createTransaction(
            { name, date, amount, type, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() },
            transaction => {
                addedTransactions.push({
                    amount: transaction.amount,
                    name: transaction.name,
                    date: transaction.date,
                    type: transaction.type,
                    category: transaction.category,
                    assetType: transaction.assetType.toLowerCase(),
                    currency: transaction.currency.toUpperCase()
                });
            },
            () => logger.error("Failed to add transaction: " + transaction[i].name)
        );
    }

    if (addedTransactions.length !== transaction.length) {
        return res.status(500).send({ msg: "Failed to add transactions all transactions", addedTransactions });
    }

    return res.status(201).send({ msg: "Transactions added successfully", addedTransactions });
};

// TODO: unit test this?
const expectedCsvHeader = (header) => {
    const map = { name: null, amount: null, type: null, date: null, category: null, assettype: null, currency: null };

    const headerFields = header.split(",").map(x => x.toLowerCase().trim());
    const expectedFields = Object.keys(map);
    for (let i = 0; i < headerFields.length; i++) {
        if (expectedFields.includes(headerFields[i])) {
            map[headerFields[i]] = i;
        }
    }

    const missingFields = Object.entries(map).filter(([_, value]) => value === null);
    if (missingFields.length > 0) {
        if (missingFields.length === 1 && missingFields[0][0] === "type") {
            // this field is allowed to be missing, since it can be inferred from the amount
            return { map, valid: true };
        }

        return { missingFields: missingFields.map(([key]) => key), valid: false };
    }

    return { map, valid: true };
}

module.exports.processCSV = (req, res) => {
    const { csv } = req.body;

    if (!isDefined(csv)) {
        logger.warn("User tried to process CSV without CSV data");
        return res.status(400).send({ msg: "You need to provide CSV data" });
    }

    if (typeof csv !== "string") {
        logger.warn("User tried to process CSV with invalid data");
        return res.status(400).send({ msg: "CSV data must be a string" });
    }

    if (csv.trim() === "") {
        logger.warn("User tried to process CSV without CSV data");
        return res.status(400).send({ msg: "CSV data cannot be empty" });
    }

    const [header, ...rows] = csv.trim().split("\n");
    if (rows.length === 0) {
        logger.warn("User tried to process CSV without at least one row");
        return res.status(400).send({ msg: "Expected at least one csv row along with the csv header" });
    }

    const { map: csvStructMap, missingFields, valid } = expectedCsvHeader(header)

    if (valid) {
        // should I check if each row has the same number of fields as the header?
        // it will likely still fail, but fail for the wrong reason
        const transactions = rows.map(row => {
            const fields = row.split(",");
            return {
                name: fields[csvStructMap.name],
                amount: fields[csvStructMap.amount],
                type: csvStructMap.type ? fields[csvStructMap.type] : fields[csvStructMap.amount] > 0,
                date: fields[csvStructMap.date],
                category: fields[csvStructMap.category],
                assetType: fields[csvStructMap.assettype],
                currency: fields[csvStructMap.currency]
            }
        });

        const invalid = {};
        for (let i = 0; i < transactions.length; i++) {
            const result = validateAddTransactionRequest(transactions[i]);
            if (!result.valid) {
                invalid[i] = result.msg;
            } else {
                transactions[i] = result;
            }
        }

        // return how the transactions were interpreted and which ones were invalid
        if (Object.keys(invalid).length > 0) {
            return res.status(400).send({ msg: "Invalid CSV", invalid, transactions });
        }

        // return the ui to allow to user to verify that the transactions were interpreted correctly
        return res.status(200).send({ msg: "CSV processed successfully", transactions });
    } else {
        // TODO: use AI to determine what the header fields correspond to, if possible
        return res.status(400).send({ msg: "Invalid CSV header missing fields: " + missingFields.join(",") });
    }
};

const csv = transactions => {
    return "Name,Amount,Date,Category,Asset Type,Currency\n" +
    transactions.map(transaction =>
        transaction.name + "," + transaction.amount + "," + formatDate(transaction.date) + "," + transaction.category + "," +
        transaction.assetType + "," + transaction.currency
    ).join("\n");
};

module.exports.exportTransactions = (req, res) => {
    const format = req.params.format;
    if (format !== "csv" && format !== "json") {
        logger.warn("User tried to export transactions with invalid format: " + format);
        return res.status(400).send({ msg: "Invalid export format" });
    }

    getDatabase().getAllTransactions(
        transactions => {
            if (format === "csv") {
                res.status(200).send({ csv: csv(transactions) });
            } else {
                res.status(200).send(transactions); // this really just the same as get transactions endpoint
            }
        },
        err => {
            logger.error("An error occurred while exporting transactions: " + err);
            res.status(500).send({ msg: "An error occurred while exporting transactions" });
        }
    );
}

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

// export for unit testing
module.exports = {
    ...module.exports,
    validateAddTransactionRequest, expectedCsvHeader, csv
};