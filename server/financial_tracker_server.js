const express = require("express");

// environment variables configuration
require("dotenv").config();

global.VERSION = "0.2.0"; // TODO: use git hash as version
global.LOG_DIR = __dirname + "/logs";
const morganLogger = require("./logger/morganLogger");
const logger = require("./logger/index.js").setup();

global.env = process.env.NODE_ENV || "development";
global.MOCK_CONVERSIONS = process.env.MOCK_CONVERSIONS;
global.DB_PATH = process.env.DB_PATH;
// these global vars are pretty bad
global.dbLock = global.dbLock || false; // json
global.databaseConnected = global.databaseConnected || false; // mongo
global.database = global.database || false; // sql - this one is especially terrible

// TODO: add logic to make sure this value is at least a certain amount before assigning?
const CACHE_REFRESH_INTERVAL = global.env === "test" ? 0 : (process.env.CACHE_REFRESH_INTERVAL || 1000 * 60 * 60 * 4); // 4 hours

// Server routes
const balanceRouter = require("./routes/balance.js");
const transactionRouter = require("./routes/transaction.js");
const listRouter = require("./routes/list.js");
const priceRouter = require("./routes/price.js");
const mcpRouter = require("./routes/mcp.js");

const app = express();

app.use(morganLogger);
app.use(express.json());
app.use(express.static("static"));
app.use("/assets/", express.static("assets"));
app.use("/api/ping", (_, res) => res.status(200).send({ msg: "Pong", version: global.VERSION }));

app.use("/api/balance", balanceRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/list", listRouter);
app.use("/api/price", priceRouter);
app.use("/mcp", mcpRouter);

if (global.env === "test") {
    const getDatabase = require("./db/index.js").getDatabase
    app.use("/api/admin/wipeDb", async (_, res) => {
        await (await getDatabase()).init();
        res.status(200).send();
    });
    app.use("/", (_, res) => res.status(200).send({ msg: "Ok" })); // return 200 as health check for playwright
}

// catch 404
app.use((req, res, next) => {
    res.status(404).send({ msg: "Not Found" }); // update to use UI error page, when built
});

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = val => {
    let port = parseInt(val, 10);

    // named pipe
    if (isNaN(port)) return val;

    // port number
    if (port >= 0) return port;
    return false;
};

/**
 * Event listener for HTTP server "error" event.
 */
const onError = error => {
    if (error.syscall !== "listen") {
        throw error;
    }

    let bind = typeof port === "string" ? "Pipe " + global.PORT : "Port " + global.PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            logger.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            logger.error("Unknown error occurred: " + error);
            setTimeout(() => {
                try {
                    // I'm not sure this will do what you expect
                    logger.info("Attempting to listen again");
                    server.close();
                    server.listen(global.PORT);
                } catch (e) {
                    logger.error("Failed to listen again");
                }
            }, 1000);
            // throw error;
    }
};

// catch all exception handler
process.on("uncaughtException", (err) => { logger.error("Caught in catch-all: " + err); console.error(err); });

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
    let addr = server.address();
    let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    logger.info("Listening on " + bind);
};

// Get port from environment (or 5000) and store in Express.
global.PORT = normalizePort(process.env.PORT || "5000");
app.set("port", global.PORT);

// Create HTTP server.
const http = require("http");
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);

const { setupDatabase, getDatabase } = require("./db/index.js");
const runCacheWorker = async () => {
    const { generateCryptoConversionMap, generateFiatConversionMap, generateStockPriceMap } = require("./utils/currency");
    const { makeBool, sleep } = require("./utils/utils");
    const { DEFAULT_CURRENCIES, ASSET_TYPE } = require("./utils/constants");
    const fs = require("fs");

    while(true) {
        logger.info("Running cache worker...");
        const db = await getDatabase();
        const cache = db.getCache();

        // wait for the cache to expire, on first run (if existed)
        if (cache.lastUpdated) {
            global.cacheCreated = true; // don't block endpoints if a cache exist
            const nextRefresh = cache.lastUpdated + CACHE_REFRESH_INTERVAL;
            const now = new Date().getTime();
            if (nextRefresh > now) {
                const wait = nextRefresh - now;
                logger.info("Cache refresh in " + (wait) + "ms");
                await sleep(wait);
            }
        }

        // merge user currencies with default currencies
        // TODO: store these currencies in cache (and update when new transaction comes in) ?
        const userCurrencies = await db.getAllTransactionCurrencies();
        const useCurrencies = {
            stock: [...new Set([...userCurrencies.stock, ...DEFAULT_CURRENCIES[ASSET_TYPE.STOCK]]).values()],
            crypto: [...new Set([...userCurrencies.crypto, ...DEFAULT_CURRENCIES[ASSET_TYPE.CRYPTO]]).values()],
            cash: [...new Set([...userCurrencies.cash, ...DEFAULT_CURRENCIES[ASSET_TYPE.CASH]]).values()]
        };

        //  might need to maintain values from previous runs, so merge values
        const returnMockValues = global.env === "test" && makeBool(global.MOCK_CONVERSIONS);
        const fiatMap = returnMockValues
            ? JSON.parse(fs.readFileSync("./test/assets/fiatConversionMap.json"))
            : await generateFiatConversionMap(useCurrencies.cash);
        const cryptoMap = returnMockValues
            ? JSON.parse(fs.readFileSync("./test/assets/cryptoConversionMap.json"))
            : await generateCryptoConversionMap(useCurrencies.crypto);
        const stockMap = returnMockValues
            ? JSON.parse(fs.readFileSync("./test/assets/stockPrices.json"))
            : await generateStockPriceMap(useCurrencies.stock);
        cache.cryptoConversions = { ...(cache.cryptoConversions ?? {}), ...cryptoMap };
        cache.fiatConversions = { ...(cache.fiatConversions ?? {}), ...fiatMap };
        cache.stockPrices = { ...(cache.stockPrices ?? {}), ...stockMap };

        db.saveCache(cache);
        global.cacheCreated = true;

        if (global.env === "test") {
            break; // only run 1x in test env
        }

        logger.info("Cache worker sleeping for " + CACHE_REFRESH_INTERVAL + "ms");
        await sleep(CACHE_REFRESH_INTERVAL);
        logger.info("Cache worker waking");
    }
}

setupDatabase(process.env.DB_TYPE).then(success => {
    if (!success) {
        logger.error("Failed to set up database");
        process.exit(1);
    }
    global.ACTIVE_DB_TYPE = process.env.DB_TYPE;
    logger.info("Database '" + global.ACTIVE_DB_TYPE + "' set up successfully");
    runCacheWorker(); // might need to wait for this to run the first time?
    // should probably extract this better (or not use http server at all)
    if (global.env === "test" && process.env.RUN_SERVER === "false") {
        return;
    }
    server.listen(global.PORT);
}).catch((err) => {
    logger.error("An error occurred while setting up the database: " + err);
    process.exit(1);
});

module.exports = app;