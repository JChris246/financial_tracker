const logger = require("../logger").setup();

const { getDatabase } = require("../db/index");
const { isNumber, isDefined, isValidArray, formatDate, padRight, isValidString, parseDate } = require("../utils/utils");
const { ASSET_TYPE, ASSET_CURRENCIES } = require("../utils/constants");

module.exports.getTransactions = async (type) => {
    let options = {}; // get all transactions

    // TODO: update the filtering logic
    // if req specifies type of transactions to retrieve, add it to options
    if (type === "income" || type === "spend") {
        // options = { "type": req.params.type === "income" };
    }

    const transactions = await (await getDatabase()).getAllTransactions();
    if (transactions) {
        return ({
            success: true,
            transactions: transactions.map(({ name, date, amount, category, assetType, currency, id }) =>
                ({ name, date, amount, category, assetType, currency, id }))
        })
    }
    return { success: false };
};

const validateAddTransactionRequest = (reqBody) => {
    const { name, date: userDate, amount: userAmount, category: userCategory, assetType, currency } = reqBody;

    // get the timestamp from user, if it doesn't exist use the current timestamp
    const date = parseDate(userDate) || new Date(); // if the date was not parsed correctly, current timestamp will be used

    const uAmount = isValidString(userAmount) ? userAmount.replaceAll(",", "") : userAmount;
    if (!isNumber(uAmount)) {
        logger.warn("User tried to add a transaction without an amount");
        return { valid: false, msg: "You need to have the transaction amount" };
    }
    const amount = Number(uAmount);

    if (amount === 0) {
        logger.warn("User tried to add a transaction with an amount of 0");
        return { valid: false, msg: "You need to have a valid transaction amount" };
    }

    if (!name) {
        logger.warn("User tried to add a transaction without a name");
        return { valid: false, msg: "You need to have the transaction name" };
    }

    let category = userCategory;
    if (!isDefined(userCategory)) {
        logger.warn("Transaction adding without a category, defaulting to other");
        category = "other";
    }

    // TODO: should we allow a default?
    if (!isDefined(assetType)) {
        logger.warn("User tried to add a transaction without an asset type");
        return { valid: false, msg: "You need to have the transaction asset type" };
    }

    if (Object.values(ASSET_TYPE).indexOf(assetType.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid asset type");
        return { valid: false, msg: "You need to have a valid transaction asset type" };
    }

    // TODO: should we allow a default? use configured base currency (maybe USD) for assetType cash for example?
    if (!isDefined(currency)) {
        logger.warn("User tried to add a transaction without a currency");
        return { valid: false, msg: "You need to have the transaction currency" };
    }

    // TODO: make all asset currencies a common case
    if (ASSET_CURRENCIES[assetType.toLowerCase()].map(x => x.toLowerCase()).indexOf(currency.toLowerCase()) === -1) {
        logger.warn("User tried to add a transaction with an invalid currency: " + currency + " for asset type: " + assetType);
        return { valid: false, msg: "Asset currency not supported" };
    }

    // TODO: Please Please make the currencies a common case
    return { valid: true, name, date: date.getTime(), amount, category, assetType: assetType.toLowerCase(),
        currency: assetType === ASSET_TYPE.CASH ? currency.toLowerCase() : currency.toUpperCase() };
}

module.exports.addTransaction = async (reqBody) => {
    const result = validateAddTransactionRequest(reqBody);
    if (!result.valid) {
        return { success: false, code: 400, msg: result.msg };
    }

    const { name, date, amount, category, assetType, currency } = result;
    const transaction = await (await getDatabase()).createTransaction(
        { name, date, amount, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() }
    );

    if (transaction) {
        return ({
            success: true,
            transaction: {
                // maybe I should separate the payload from the message ?
                amount: transaction.amount,
                name: transaction.name,
                date: transaction.date,
                category: transaction.category,
                assetType: transaction.assetType.toLowerCase(),
                currency: transaction.currency.toUpperCase(),
                msg: "Transaction added successfully",
            }
        });
    }

    return { success: false, code: 500, msg: "Failed to add transaction"}
};

module.exports.addTransactions = async (userTransactions) => {
    if (!isValidArray(userTransactions)) {
        logger.warn("User tried to add transactions without a valid array");
        return { success: false, code: 400, msg: "You need to have at least one transaction" };
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
        return { success: false, code: 400, msg: "You have " + invalid + " invalid transactions" };
    }

    const transactions = transaction.map(({ name, date, amount, category, assetType, currency }) =>
        ({ name, date, amount, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() }))

    const { success, savedTransactions } = await (await getDatabase()).createTransactions(transactions);
    if (!success) {
        return { success: false, code: 500, msg: "Failed to add transactions all transactions" };
    }

    const addedTransactions = savedTransactions.map(({ amount, name, date, category, assetType, currency }) =>
        ({ amount, name, date, category, assetType: assetType.toLowerCase(), currency: currency.toUpperCase() }));
    return { success: true, msg: "Transactions added successfully", addedTransactions };
};

const expectedHeader = (header, separator) => {
    const map = { name: null, amount: null, date: null, category: null, assettype: null, currency: null };

    const headerFields = header.split(separator).map(x => x.toLowerCase().trim().replace(" ", ""));
    const expectedFields = Object.keys(map);
    for (let i = 0; i < headerFields.length; i++) {
        if (expectedFields.includes(headerFields[i])) {
            map[headerFields[i]] = i;
        }
    }

    const missingFields = Object.entries(map).filter(([_, value]) => value === null);
    if (missingFields.length > 0) {
        if (missingFields.length === 1 && missingFields[0][0] === "category") {
            // this field is allowed to be missing, since we can default it to "other"?
            return { map, valid: true };
        }

        return { missingFields: missingFields.map(([key]) => key), valid: false };
    }

    return { map, valid: true };
};

const isEmptyRow = (fields) => {
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].trim() !== "" && !fields[i].trim().match(/^[-]+$/)) {
            return false;
        }
    }

    // all row were either blank or only -'s, this must be an empty record
    return true;
};

module.exports.processCSV = ({ csv }) => {
    if (!isDefined(csv)) {
        logger.warn("User tried to process CSV without CSV data");
        return { success: false, response: { msg: "You need to provide CSV data" } };
    }

    if (typeof csv !== "string") {
        logger.warn("User tried to process CSV with invalid data");
        return { success: false, response: { msg: "CSV data must be a string" } };
    }

    if (csv.trim() === "") {
        logger.warn("User tried to process CSV without CSV data");
        return { success: false, response: { msg: "CSV data cannot be empty" } };
    }

    const [header, ...rows] = csv.trim().split("\n");
    if (rows.length === 0) {
        logger.warn("User tried to process CSV without at least one row");
        return { success: false, response: { msg: "Expected at least one csv row along with the csv header" } };
    }

    const { map: csvStructMap, missingFields, valid } = expectedHeader(header, ",");

    if (valid) {
        // should I check if each row has the same number of fields as the header?
        // it will likely still fail, but fail for the wrong reason
        const transactions = rows
            .filter(row => !isEmptyRow(row.split(",")))
            .map(row => {
                const fields = row.split(",");
                return {
                    name: fields[csvStructMap.name]?.trim(),
                    amount: fields[csvStructMap.amount]?.trim(),
                    date: fields[csvStructMap.date]?.trim(),
                    category: csvStructMap.category ? fields[csvStructMap.category].trim() : "other",
                    assetType: fields[csvStructMap.assettype]?.trim(),
                    currency: fields[csvStructMap.currency]?.trim()
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
            return { success: false, response: { msg: "Invalid CSV", invalid, transactions } };
        }

        // return the ui to allow to user to verify that the transactions were interpreted correctly
        return { success: true, response: { msg: "CSV processed successfully", transactions } };
    } else {
        // TODO: use AI to determine what the header fields correspond to, if possible
        return { success: false, response: { msg: "Invalid CSV header missing fields: " + missingFields.join(",") } };
    }
};

module.exports.processMd = ({ md }) => {
    if (!isDefined(md)) {
        logger.warn("User tried to process markdown table without md data");
        return { success: false, response: { msg: "You need to provide a valid markdown table" } };
    }

    if (typeof md !== "string") {
        logger.warn("User tried to process markdown table with invalid data");
        return { success: false, response: { msg: "payload must be a string" } };
    }

    if (md.trim() === "") {
        logger.warn("User tried to process markdown table without data");
        return { success: false, response: { msg: "payload cannot be empty" } };
    }

    if (md.trim().split("\n").length < 2) {
        logger.warn("User tried to process a string that may not be a valid markdown table")
        return { success: false, response: { msg: "invalid markdown format detected" } };
    }

    const [header, separator, ...rows] = md.trim().split("\n");
    if (rows.length === 0) {
        logger.warn("User tried to process markdown table without at least one row");
        return { success: false, response: { msg: "Expected at least one markdown table row along with the headers" } };
    }

    // TODO: probably should validate the "separator" is actually the markdown table header separator

    const { map: mdStructMap, missingFields, valid } = expectedHeader(header, "|")

    if (valid) {
        // should I check if each row has the same number of fields as the header?
        // it will likely still fail, but fail for the wrong reason
        const transactions = rows
            .filter(row => !isEmptyRow(row.split("|")))
            .map(row => {
                const fields = row.split("|");
                return {
                    name: fields[mdStructMap.name]?.trim(),
                    amount: fields[mdStructMap.amount]?.trim(),
                    date: fields[mdStructMap.date]?.trim(),
                    category: mdStructMap.category ? fields[mdStructMap.category].trim() : "other",
                    assetType: fields[mdStructMap.assettype]?.trim(),
                    currency: fields[mdStructMap.currency]?.trim()
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
            return { success: false, response: { msg: "Invalid markdown table", invalid, transactions } };
        }

        // return the ui to allow to user to verify that the transactions were interpreted correctly
        return { success: true, response: { msg: "Markdown table processed successfully", transactions } };
    } else {
        // TODO: use AI to determine what the header fields correspond to, if possible
        return { success: false, response: { msg: "Invalid markdown table header, missing fields: " + missingFields.join(",") } };
    }
};

const csv = transactions => {
    // TODO: format money amount?
    return "Name,Amount,Date,Category,Asset Type,Currency\n" +
    transactions.map(transaction =>
        transaction.name.replaceAll(",", "") + "," + transaction.amount + "," + formatDate(transaction.date) + "," +
        transaction.category.replaceAll(",", "") + "," + transaction.assetType + "," + transaction.currency
    ).join("\n");
};

const md = transactions => {
    if (transactions.length < 1) {
        return (
            `| Name | Amount | Date | Category | Asset Type | Currency |\n| ---- | ------ | ---- | -------- | ---------- | -------- |`
        );
    }

    const lengths = { name: 6, amount: 8, date: 6, category: 10, assetType: 12, currency: 10 };
    for (let i = 0; i < transactions.length; i++) {
        Object.keys(lengths).forEach(key => {
            const currentLength = key === "date" ? formatDate(transactions[i][key]).length : String(transactions[i][key]).length;
            lengths[key] = lengths[key] < currentLength + 2 ? currentLength + 2 : lengths[key];
        })
    }

    // TODO: format money amount?
    const header = "|" + [
        padRight(" Name", lengths.name, " "), padRight(" Amount", lengths.amount, " "), padRight(" Date", lengths.date, " "),
        padRight(" Category", lengths.category, " "), padRight(" Asset Type", lengths.assetType, " "), padRight(" Currency", lengths.currency, " ")
    ].join("|") + "|";
    const headerSeparator = "|" + [
        padRight(" ", lengths.name-1, "-") + " ", padRight(" ", lengths.amount-1, "-") + " ", padRight(" ", lengths.date-1, "-") + " ",
        padRight(" ", lengths.category-1, "-") + " ", padRight(" ", lengths.assetType-1, "-") + " ", padRight(" ", lengths.currency-1, "-") + " "
    ].join("|") + "|";

    let body = "";
    for (let i = 0; i < transactions.length; i++) {
        body += "|" + [
            padRight(" " + transactions[i].name, lengths.name, " "), padRight(" " + transactions[i].amount, lengths.amount, " "),
            padRight(" " + formatDate(transactions[i].date), lengths.date, " "), padRight(" " + transactions[i].category, lengths.category, " "),
            padRight(" " + transactions[i].assetType, lengths.assetType, " "), padRight(" " + transactions[i].currency, lengths.currency, " ")
        ].join("|") + "|" + (i === transactions.length -1 ? "" : "\n");
    }

    return header + "\n" + headerSeparator + "\n" + body;
};

module.exports.exportTransactions = async (params) => {
    const { format } = params;
    if (format !== "csv" && format !== "json" && format !== "md") {
        logger.warn("User tried to export transactions with invalid format: " + format);
        return { success: false, code: 400, msg: "Invalid export format" };
    }

    const transactions = await (await getDatabase()).getAllTransactions();
    if (transactions) {
        if (format === "csv") {
            return { success: true, response: { csv: csv(transactions) } };
        } else if (format == "md") {
            return { success: true, response: { md: md(transactions) } };
        } else {
            // this is really just the same as get transactions endpoint
            return {
                success: true,
                response: transactions.map(({ name, date, amount, category, assetType, currency }) =>
                    ({ name, date, amount, category, assetType, currency }))
            };
        }
    } else {
        logger.error("An error occurred while exporting transactions: " + err);
        return { success: false, code: 500, msg: "An error occurred while exporting transactions" };
    }
};

module.exports.getGraphData = async () => {
    const transactions = await (await getDatabase()).getAllTransactions();
    if (transactions) {
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

        return { success: true, response: graphData };
    }
    return { success: false , msg: "getGraphData - An error occurred fetching transactions" };
};

// export for unit testing
module.exports = {
    ...module.exports,
    validateAddTransactionRequest, expectedHeader, csv, md, isEmptyRow
};