const express = require("express");

// environment variables configuration
require("dotenv").config();

global.VERSION = "0.2.0";
global.LOG_DIR = __dirname + "/logs";
const morganLogger = require("./logger/morganLogger");
const logger = require("./logger/index.js").setup();

global.env = process.env.NODE_ENV || "development";
global.DB_PATH = process.env.DB_PATH;

// Server routes
const balanceRouter = require("./routes/balance.js");
const transactionRouter = require("./routes/transaction.js");
const listRouter = require("./routes/list.js");

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

if (global.env === "test") {
    const getDatabase = require("./db/index.js").getDatabase
    app.use("/api/admin/wipeDb", (_, res) => {
        getDatabase().init();
        res.status(200).send();
    });
    app.use("/", (_, res) => res.status(200).send({ msg: "Ok" })); // return 200 as health check for playwright
}

// error handler
app.use((err, req, res) => {
    // render the error page
    res.status(err.status || 500);
    res.render("error");
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

const setupDatabase = require("./db/index.js").setupDatabase;
setupDatabase(process.env.DB_TYPE).then(success => {
    if (!success) {
        logger.error("Failed to set up database");
        process.exit(1);
    }
    global.ACTIVE_DB_TYPE = process.env.DB_TYPE;
    logger.info("Database '" + global.ACTIVE_DB_TYPE + "' set up successfully");
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