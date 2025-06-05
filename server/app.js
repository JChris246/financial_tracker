const express = require("express");
const mongoose = require("mongoose");

// environment variables configuration
require("dotenv").config();

global.env = process.env.NODE_ENV || "development";

// Server routes
const balanceRouter = require("./routes/balance");
const transactionRouter = require("./routes/transaction");

const app = express();

app.use(express.json());
app.use(express.static("static"));
app.use("/assets/", express.static("assets"));

app.use("/api/balance", balanceRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/transactions", transactionRouter);

// error handler
app.use((err, req, res) => {
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// error handler
app.use(function (err, req, res) {
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
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            console.error("Unknown error occurred: " + error);
            setTimeout(() => {
                try {
                    console.log("Attempting to listen again");
                    server.close();
                    server.listen(global.PORT);
                } catch (e) {
                    console.error("Failed to listen again");
                }
            }, 1000);
            // throw error;
    }
};

// catch all exception handler
process.on("uncaughtException", (err) => { console.error("Caught in catch-all: " + err); console.log(err); });

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
    let addr = server.address();
    let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);
};

// Get port from environment (or 5000) and store in Express.
global.PORT = normalizePort(process.env.PORT || "5000");
app.set("port", global.PORT);

// Create HTTP server.
const http = require("http");
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);

// try to connect to mongo
// if successful allow the server to start accepting requests
// else log the error and terminate
const DB_URL = "mongodb://" + process.env.DB_HOST + "/" + process.env.DB_NAME;
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
}).then(() => server.listen(global.PORT)).catch(e => {
    console.log(e);
});